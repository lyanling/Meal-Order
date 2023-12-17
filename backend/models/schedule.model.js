import { scheduleJob, RecurrenceRule } from "node-schedule";
import { query } from "../models/dbasync.model.js";
import SendMail from "./mail.model.js";

export const SendDailyEmail = async () => {
    try {
        const today = new Date(), year = today.getFullYear(), month = today.getMonth() + 1, date = today.getDate();
        const start = `${year}-${month}-${date} 00:00:00`;
        const end = `${year}-${month}-${date} 23:59:59`;
        const [rows, __] = await query('SELECT o.`Order_ID`, o.`Vendor_ID`, o.`Customer_ID`, o.`MEAL_List`, o.`Pickup_Time`, v.`Email` as vEmail, c.`Email` as cEmail \
                                        FROM `Order` o JOIN `Vendor` v ON o.`Vendor_ID` = v.`Vendor_ID` \
                                        JOIN `Customer` c ON o.`Customer_ID` = c.`Customer_ID` WHERE o.`Status` = ? \
                                        AND o.`Pickup_Time` BETWEEN ? AND ?', ['PREPARING', start, end]);
        const vendors = new Map(), customers = new Map(); //(email, text)
        for (const row of rows) {
            const vEmail = row.vEmail, cEmail = row.cEmail;
            if (!vendors.has(vEmail)) {
                vendors.set(vEmail, '');
            }
            if (!customers.has(cEmail)) {
                customers.set(cEmail, '');
            }
            vendors.set(vEmail, vendors.get(vEmail) + `訂單編號 ${row.Order_ID}\n時間: ${row.Pickup_Time}\n餐點清單\n`);
            customers.set(cEmail, customers.get(cEmail) + `訂單編號 ${row.Order_ID}\n時間: ${row.Pickup_Time}\n餐點清單\n`);
            for (const meal of row.MEAL_List) {
                const [mealrows, ] = await query('SELECT `Meal_Name` FROM `Meal` WHERE Meal_ID = ?', [meal.Meal_ID]);
                const mealName = mealrows[0]['Meal_Name'];
                vendors.set(vEmail, vendors.get(vEmail) + `${mealName} x ${meal.Amount}\n`);
                customers.set(cEmail, customers.get(cEmail) + `${mealName} x ${meal.Amount}\n`);
            }
            vendors.set(vEmail, vendors.get(vEmail) + `-----------\n`);
            customers.set(cEmail, customers.get(cEmail) + `-----------\n`);
        }
        vendors.forEach((text, email) => {
            SendMail({to: email, subject: `FoodApp: ${year}/${month}/${date} 餐點預訂通知`, text: text});
        });
        customers.forEach((text, email) => {
            SendMail({to: email, subject: `FoodApp: ${year}/${month}/${date} 餐點製作通知`, text: text});
        });
    } catch (error) {
        throw error;
    }
}

export const SetMealDefault = async () => {
    try {
        const [meals, __] = await query('SELECT `Meal_ID`, `Inventory`, `Default_Inventory` FROM `MEAL`', []);
        for (const meal of meals) {
            const mealId = meal.Meal_ID, Inventory = meal.Inventory, day = ((new Date().getDay() + 6) % 7 + 1).toString();
            Inventory[day] = meal.Default_Inventory;
            await query('UPDATE `MEAL` m SET m.Inventory = ? WHERE m.`Meal_ID` = ?', [JSON.stringify(Inventory), mealId]);
        }
    } catch (error) {
        throw error;
    }
}

export default function DailySchedule() {
    const rule = new RecurrenceRule();
    rule.hour = 0;
    rule.minute = 0;
    rule.second = 0;
    rule.tz = 'CST';
    return scheduleJob(rule, () => {
        try {
            SendDailyEmail();
            SetMealDefault();
        } catch (error) {
            console.log(error);
        }
    });
}