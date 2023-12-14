import express from 'express';
import { query } from "../models/dbasync.model.js";

const router = express.Router();

const getOrders = async (req, res, next) => {
    const display = req.body.display;
    if (display == 0) {
        await getOrdersInProgress(req, res, next);
    } else {
        await getOrdersCompleted(req, res, next);
    }
};

const getOrdersCompleted = async (req, res, next) => {
    const customer_id = req.body.customerID;
    const completed_order_time = req.body.completed_order_time;
    try {
        const query_str = 'SELECT orders.*, Vendor.Name AS Vendor_Name \
            FROM (SELECT * from`Order` WHERE Customer_ID = ? \
                AND (Pickup_Time >= ?) \
                AND (`Status` = ? OR `Status` = ? OR `Status` = ?)) AS orders \
            LEFT JOIN Vendor ON orders.Vendor_ID = Vendor.Vendor_ID;';
        const [rows, fields] = await query(query_str, 
            [customer_id, completed_order_time, "PICKED_UP", "CANCELLED_UNCHECKED", "CANCELLED_CHECKED"]);
        res.json(rows);
    }
    catch (err) {
        throw err;
    }
};

const getOrdersInProgress = async (req, res, next) => {
    const customer_id = req.body.customerID;
    try {
        const query_str = 'SELECT orders.*, Vendor.Name AS Vendor_Name \
            FROM (SELECT * from`Order` WHERE Customer_ID = ? AND (`Status` = ? OR `Status` = ? OR `Status` = ?)) AS orders \
            LEFT JOIN Vendor ON orders.Vendor_ID = Vendor.Vendor_ID;';
        const [rows, fields] = await query(query_str,
            [customer_id, "WAIT_FOR_APPROVAL", "PREPARING", "READY_FOR_PICKUP"]);
        res.json(rows);
    }
    catch (err) {
        throw err;
    }
};

const getOrderMeals = async (req, res, next) => {
    const order_meal_ids = req.body.orderMealIDs;
    var query_results = [];
    for (let i = 0; i < order_meal_ids.length; i++) {
        try {
            const query_str = 'SELECT Meal_ID, Meal_Name, Price, Image_url FROM `Meal` WHERE `Meal_ID` = ?';
            const [rows, fields] = await query(query_str, [order_meal_ids[i]]);
            query_results.push(...rows);
        }
        catch (err) {
            throw err;
        }
    }
    res.json(query_results);
};


/* get inventory info */
async function getInventoryInfo(day, meal_id, amount) {
    let inventory;
    try {
        const query_inventory_info = 'SELECT `Inventory` FROM `Meal` Where Meal_ID = ?;'
        const [rows, fields] = await query(query_inventory_info, [meal_id]);
        // console.log(rows);
        inventory = rows[0]['Inventory'];
        // console.log("get inventory info: inventory = ", inventory);
        inventory[day] = inventory[day] + amount;
    }
    catch (err) {
        console.log(err);
        throw err;
    }

    return inventory;
}

/* update inventory */
async function updateInventory(day, meal_id, amount) {
    // console.log("update inventory: day = ", day, ", meal_id = ", meal_id, ", amount = ", amount);
    const inventory = await getInventoryInfo(day, meal_id, amount);
    try {
        const query_inventory_update = 'UPDATE `Meal` SET `Inventory` = ? WHERE Meal_ID = ?;'
        const [rows, fields] = await query(query_inventory_update, [JSON.stringify(inventory), meal_id]);
        // console.log("update inventory: inventory = ", inventory);
        // console.log("update inventory: rows = ", rows);
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}

const cancelOrder = async (req, res, net) => {
    const order = req.body.order;
    const date = new Date(order.Pickup_Time);
    const day = (date.getDay() == 0)? 7 : date.getDay();
    // console.log("in cancelOrder: order = ", order);

    // update db: order status
    try {
        const query_str = 'UPDATE `Order` SET `Status` = ? WHERE Order_ID = ?;'
        const [rows, fields] = await query(query_str, ["CANCELLED_UNCHECKED", order['Order_ID']]);
        // console.log("changedRows = ", rows['changedRows']);
        res.json(rows['changedRows']);
    }
    catch (err) {
        console.log(err);
        throw err;
    }

    // update db: meal inventory
    order['Meal_List'].forEach(order_meal => {
        updateInventory(day, order_meal.Meal_ID, order_meal.Amount)
    })
}

router.post('/', getOrders);
router.post('/cancelOrder', cancelOrder);
router.post('/orderMeals', getOrderMeals)

export default router;

