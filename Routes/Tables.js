const express = require('express')
const router = express.Router()
const Table = require('../models/Table')
const CompletedOrder = require('../models/CompletedOrder')
const { authMiddleware, roleMiddleware } = require('../Middlewares/auth')

module.exports = (io) => {
  // 1. Delete the table with the highest table number

  router.delete(
    '/delete',
    authMiddleware,
    roleMiddleware('owner'),
    async (req, res) => {
      try {
        const table = await Table.findOne().sort({ table_number: -1 }).exec()
        if (table) {
          await Table.findByIdAndDelete(table._id)
          io.emit('tableDeleted', table)
          res.status(200).send({
            message: 'Table with the highest table number deleted successfully',
          })
        } else {
          res.status(404).send({ message: 'No table found to delete' })
        }
      } catch (error) {
        res.status(500).send({ message: 'Error deleting table', error })
      }
    }
  )

  router.get('/', authMiddleware, async (req, res) => {
    try {
      const tables = await Table.find().exec()
      res.status(200).send(tables)
    } catch (error) {
      res.status(500).send({ message: 'Error fetching tables', error })
    }
  })

  // 2. Add a table with table number max value + 1
  router.post(
    '/add',
    authMiddleware,
    roleMiddleware('owner'),
    async (req, res) => {
      try {
        const maxTable = await Table.findOne().sort({ table_number: -1 }).exec()
        const newTableNumber = maxTable ? maxTable.table_number + 1 : 1

        const newTable = new Table({
          table_number: newTableNumber,
          condition: '',
          order: [],
        })
        await newTable.save()
        io.emit('tableAdded', newTable)
        res.status(201).send(newTable)
      } catch (error) {
        res.status(500).send({ message: 'Error adding table', error })
      }
    }
  )

  // 3. Update an order in a table
  // router.put('/:tableId/order', async (req, res) => {
  //   try {
  //     const { tableId } = req.params;
  //     const { name, qty, status, price, total_price, note } = req.body;

  //     const table = await Table.findById(tableId);
  //     if (!table) {
  //       return res.status(404).send({ message: 'Table not found' });
  //     }

  //     const orderItem = { name, qty, status, price, total_price, note };
  //     table.order.push(orderItem);
  //     await table.save();

  //     io.emit('orderUpdated', table);
  //     res.status(200).send(table);
  //   } catch (error) {
  //     res.status(500).send({ message: 'Error updating order', error });
  //   }
  // });

  router.put('/:tableId/order', authMiddleware, async (req, res) => {
    // console.log(req.body)
    try {
      const { tableId } = req.params
      //console.log(tableId)
      const { name, qty, status, price, total_price, note, action } = req.body
      //console.log(name, qty, status, price, total_price, note,action)
      const table = await Table.findById(tableId)
      if (!table) {
        return res.status(404).send({ message: 'Table not found' })
      }

      if (action === 'delete') {
        // Check if the action is to delete an item
        const orderItem = { name, qty, status, price, total_price, note }
        const index = table.order.findIndex(
          (item) =>
            item.name === name &&
            item.price === price &&
            item.note === note &&
            item.total_price === total_price &&
            item.qty === qty
        )
        if (index === -1) {
          return res
            .status(404)
            .send({ message: 'Item not found in order or not pending' })
        }
        //console.log(index);
        table.order.splice(index, 1)
        // console.log(table.order)
        io.emit('orderDeleted', tableId, orderItem) // Remove the item from the order
      } else {
        // Add or update the order item
        const orderItem = { name, qty, status, price, total_price, note }
        table.order.push(orderItem)
        table.date = new Date()
        io.emit('orderTaken', tableId, orderItem)
      }

      await table.save()
      io.emit('orderUpdated', table)
      res.status(200).send(table)
    } catch (error) {
      res.status(500).send({ message: 'Error updating order', error })
    }
  })

  // router.put('/:tableId/order', async (req, res) => {
  //   try {
  //     const { tableId } = req.params;
  //     const { name, qty, status, price, total_price, note } = req.body;

  //     const table = await Table.findById(tableId);
  //     if (!table) {
  //       return res.status(404).send({ message: 'Table not found' });
  //     }

  //     const existingOrderItemIndex = table.order.findIndex(item => item.name === name && item.status === 'pending');

  //     if (existingOrderItemIndex !== -1) {
  //       // Update existing pending order
  //       table.order[existingOrderItemIndex].qty += qty;
  //       table.order[existingOrderItemIndex].total_price += total_price;
  //     } else {
  //       // Add new order item
  //       const newOrderItem = { name, qty, status, price, total_price, note };
  //       table.order.push(newOrderItem);
  //     }

  //     await table.save();

  //     io.emit('orderUpdated', table);
  //     res.status(200).send(table);
  //   } catch (error) {
  //     res.status(500).send({ message: 'Error updating order', error });
  //   }
  // });

  // 4. Book a table
  router.put('/:tableId/book', authMiddleware, async (req, res) => {
    try {
      const { tableId } = req.params
      const table = await Table.findById(tableId)
      if (!table) {
        return res.status(404).send({ message: 'Table not found' })
      }

      table.condition = 'running'
      await table.save()

      io.emit('tableBooked', table)
      res.status(200).send(table)
    } catch (error) {
      res.status(500).send({ message: 'Error booking table', error })
    }
  })

  // 5. Free a table
  router.put(
    '/:tableId/free',
    authMiddleware,
    roleMiddleware('owner'),
    async (req, res) => {
      try {
        const { tableId } = req.params
        const table = await Table.findById(tableId)
        if (!table) {
          return res.status(404).send({ message: 'Table not found' })
        }
        let totalBill = 0
        for (let i = 0; i < table.order.length; i++) {
          totalBill += table.order[i].total_price
        }
        const completedOrder = {
          table_number: table.table_number,
          orders: table.order.map((item) => ({
            name: item.name,
            qty: item.qty,
            price: item.price,
            total_price: item.total_price,
            note: item.note, // Include the note field
          })),
          total_bill: totalBill,
          timestamp: new Date(),
        }

        await CompletedOrder.create(completedOrder)

        table.condition = ''
        table.order = []
        await table.save()

        io.emit('tableFreed', tableId)
        res.status(200).send(table)
      } catch (error) {
        res.status(500).send({ message: 'Error freeing table', error })
      }
    }
  )

  // 6. Change status of a food item to ongoing
  router.put(
    '/:tableId/order/ongoing',
    authMiddleware,
    roleMiddleware('cook'),
    async (req, res) => {
      // console.log(req.body)
      try {
        const { tableId } = req.params
        const { name, qty, note, price } = req.body

        const table = await Table.findById(tableId)
        if (!table) {
          return res.status(404).send({ message: 'Table not found' })
        }

        const orderItem = table.order.find(
          (item) =>
            item.name === name &&
            item.status === 'pending' &&
            item.price === price &&
            item.note === note &&
            item.qty === qty
        )
        if (!orderItem) {
          return res
            .status(404)
            .send({ message: 'Order item with pending status not found' })
        }

        orderItem.status = 'ongoing'
        await table.save()

        io.emit('orderStatusOngoing', tableId, orderItem)
        // console.log('Event emiited')
        return res.status(200).send(table)
      } catch (error) {
        res
          .status(500)
          .send({ message: 'Error updating order item status', error })
      }
    }
  )

  // 7. Change status of a food item to done
  router.put(
    '/:tableId/order/done',
    authMiddleware,
    roleMiddleware('cook'),
    async (req, res) => {
      try {
        const { tableId } = req.params
        const { name, qty, price, note } = req.body

        const table = await Table.findById(tableId)
        if (!table) {
          return res.status(404).send({ message: 'Table not found' })
        }

        const orderItem = table.order.find(
          (item) =>
            item.name === name &&
            (item.status === 'ongoing' ||
              (item.status === 'pending' &&
                item.price === price &&
                item.note === note &&
                item.qty === qty))
        )
        if (!orderItem) {
          return res.status(404).send({
            message: 'Order item with ongoing or pending status not found',
          })
        }

        orderItem.status = 'done'
        await table.save()
        console.log(table.order)
        io.emit('orderStatusDone', tableId, orderItem)
        return res.status(200).send(table)
      } catch (error) {
        res
          .status(500)
          .send({ message: 'Error updating order item status', error })
      }
    }
  )

  router.get('/:tableId', authMiddleware, async (req, res) => {
    try {
      const { tableId } = req.params
      const table = await Table.findById(tableId)

      if (!table) {
        return res.status(404).send({ message: 'Table not found' })
      }

      res.status(200).send(table)
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Error fetching table data', error })
    }
  })

  return router
}
