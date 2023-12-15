import express from 'express';
import { query } from "../models/dbasync.model.js";

const router = express.Router();

const GetOrderMeal= async (req, res, next) => {
    try {
        const [rows, fields] = await query('select a.`Image_url` as `Vendor_img`,a.`Name`,a.`Address` \
                                                    ,b.`Meal_Name`,b.`Meal_ID`,b.`Description`,b.`Price`,b.`Inventory` \
                                                    ,b.`Image_url` from `Vendor` a inner join `Meal` b \
                                                on a.`Vendor_ID`= b.`Vendor_ID` \
                                                where a.`VENDOR_ID`=?',[req.query.vid]);
        res.json(rows);
    }
    catch (err) {
        throw err;
    }
}

const AdjustMealList = async(order_id,meal_id,count,append)=>{
    const cmd2_a = "Select `Meal_List` from `Order` where `Order_ID` = ?";
    const cmd2_b = "Select `Price` from `Meal` where `Meal_ID`=?";
    let output_MealList = [];
    let Total_amount = 0;
    const input_MealList = (await query(cmd2_a,[order_id]))[0][0]['Meal_List']
    if(append){
        for(let i=0;i<input_MealList.length;i++){
            if (input_MealList[i]['Meal_ID']==meal_id){
                input_MealList[i]['Amount'] = input_MealList[i]['Amount'] + count;
            }
            output_MealList.push(input_MealList[i])
            const price = (await query(cmd2_b,[input_MealList[i]['Meal_ID']]))[0][0]['Price']
            Total_amount = Total_amount + price*input_MealList[i]['Amount']
        }
    }
    else{
        output_MealList = input_MealList;
        output_MealList.push({'Amount':count,'Meal_ID':meal_id});
        for(let i=0;i<input_MealList.length;i++){
            const price = (await query(cmd2_b,[input_MealList[i]['Meal_ID']]))[0][0]['Price']
            Total_amount = Total_amount + price*input_MealList[i]['Amount']
        }
    }
    return [output_MealList,Total_amount];
}

const AddCart = async(req,res,next)=>{
    const day = req.body.day;
    const Customer_ID = req.body.Customer_ID; 
    const Vendor_ID = req.body.Vendor_ID;
    const pickuptime = new Date(req.body.pickuptime);
    const amount = req.body.count;
    const meal_ID = req.body.meal_ID;
    const Cash_Amount = req.body.Cash_Amount;
    const cmd0 = 'select JSON_EXTRACT(`Inventory`,' + " '$. "+' "?" ' + " ') as inv from `Meal` where Meal_ID=? "
    const cmd1 = 'Select `Order_ID` from `Order` \
                where `Customer_ID`=? and `Vendor_ID`=? and `Pickup_Time`=? and `Status` = "IN_CART"'

    const cmd2_1 = "Select `Order_ID`,JSON_EXTRACT(`Meal_List`,'$[*].Meal_ID') as ext from `Order` \
                where `Customer_ID`=? and `Vendor_ID`=? and `Pickup_Time`=? and `Status` = 'IN_CART'"
    
    const cmd2_2 = "Update `Order` set `Meal_List`=?, `Cash_Amount`=? where Order_ID=?"

    const str = "'[{"+'"Amount":?,"Meal_ID":?}]'+"'"
    const cmd3 = 'INSERT INTO `Order` (`Customer_ID`, `Vendor_ID`, `Status`, `Pickup_Time`, `Meal_List`, `Cash_Amount`) \
                VALUES (?,?,"IN_CART",?,'+str+',?)'

    const pickuptime_str = pickuptime.getFullYear() + '-' +
        ('00' + (pickuptime.getMonth() + 1)).slice(-2) + '-' +
        ('00' + pickuptime.getDate()).slice(-2) + ' ' +
        ('00' + pickuptime.getHours()).slice(-2) + ':' +
        ('00' + pickuptime.getMinutes()).slice(-2) + ':' +
        ('00' + pickuptime.getSeconds()).slice(-2);
    
    if((new Date()).getTime() > pickuptime.getTime()){
        res.json({msg:0})
    }
    else{
        try{
            const [rows1,] = await query(cmd0,[day,meal_ID])
            if (rows1[0]['inv']<amount || amount==0){
                res.json({msg:1});
            }
            else{        
                const [rows2,] = await query(cmd1, [Customer_ID, Vendor_ID, pickuptime_str])
                if(rows2.length==0){
                    await query(cmd3,[Customer_ID, Vendor_ID, pickuptime_str, amount, meal_ID,Cash_Amount]);
                }
                else{
                    const [rows3,] = await query(cmd2_1, [Customer_ID, Vendor_ID, pickuptime_str])
                    const append = (rows3[0]['ext'].includes(meal_ID));
                    const order_id =rows3[0]['Order_ID'];
                    const [adjust_MealList,Total_amount] = await AdjustMealList(order_id,meal_ID,amount,append);
                    await query(cmd2_2,[JSON.stringify(adjust_MealList),Total_amount,order_id]);
                }
                res.json({msg:2});
            }            
        }catch(error){
            throw error;
        }
    }
}

router.get('/', GetOrderMeal);
router.post('/addadjustMealList',AddCart);

export default router;