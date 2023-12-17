/**
 * The meal item of the meal box in the Order Meal Page
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Counter from './Counter_OrderMeal';
import {VendorAndMeal} from '../../type';
import { BACKEND_URL } from '../../constant';
import style from '../../style/OrderMeal-ShopCart/OrderMeal.module.css';

export default function MealItem({meal,inventory,soldout,mealshowday,ordertime}:{meal:VendorAndMeal, inventory:number, soldout:boolean, mealshowday:number, ordertime:string}){
    /* Get the insert information to database */
    const param = useParams();//website parameters
    const Customer_ID = param.customerId; 
    const Vendor_ID = param.vendorId; 
    const [pickuptime, setPickupTime] = useState<Date>();
    const [count, setCount] = useState(0); //the number of meal which customer selects.
    let warning:number;

    useEffect(() => {
        const time_arr = ordertime.split(',');
        setPickupTime(new Date(+time_arr[0], +time_arr[1] - 1, +time_arr[2], +time_arr[3], +time_arr[4], +time_arr[5]));
    }, [ordertime]);

    /* Backend Function: to add the meal to the Shop Cart */
    const AddCart = async (mealshowday:number,Customer_ID:number,Vendor_ID:number,count:number,meal_ID:number,Cash_Amount:number)=>{
        const url = `${BACKEND_URL}/orderMeal/addadjustMealList`;
        let t;
        if (pickuptime !== undefined) {
            try {
                t = await fetch(url, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json", },
                    body: JSON.stringify({
                        day: mealshowday,
                        Customer_ID: Customer_ID,
                        Vendor_ID: Vendor_ID,
                        pickuptime: pickuptime,
                        count: count,
                        meal_ID: meal_ID,
                        Cash_Amount: Cash_Amount
                    })
                }).then((res) => { return res.json() });
            } catch (err) {
                throw err;
            }
        }
        warning = (t['msg']);
    }
    
    if(soldout){
        return(
            <div className={style.MealBox} id={(meal.Meal_ID).toString()}>
                <div className={style.MealBox_Text}>
                    <div className={style.TitleDollarInv}>
                        <div className={style.TitleDollar}>
                            <h2>{meal.Meal_Name}</h2>
                            <p>NT${meal.Price}</p>
                        </div>
                        <div className={style.Inv}>
                            <p>庫存：{inventory}</p>
                        </div>
                    </div>
                    <div className={style.NumDollarButton}>
                        <div className={style.insertNum}></div>
                        已完售
                    </div>
                </div>
                <div className={style.Meal_imgBox} >
                    <img src={meal.Image_url} className={style.Meal_img} alt={meal.Meal_Name} />
                </div>
            </div>
        );
    }
    else{
        return(
            <div className={style.MealBox} id={(meal.Meal_ID).toString()}>
                <div className={style.MealBox_Text}>
                    <div className={style.TitleDollarInv}>
                        <div className={style.TitleDollar}>
                            <h2>{meal.Meal_Name}</h2>
                            <p>NT${meal.Price}</p>
                        </div>
                        <div className={style.Inv}>
                            <p>庫存：{inventory}</p>
                        </div>
                    </div>
                    <div className={style.NumDollarButton}>
                        <div className={style.test}>
                            新增
                        </div>
                        <div className={style.counter}>
                            <Counter count={count} setCount={setCount} maxinv={inventory}/>
                        </div>
                        <div className={style.insertNum}>
                            項，小計NT${meal.Price*count}
                        </div>
                        <button className={style.baseButton_button} onClick={async ()=> {
                            await AddCart(mealshowday, +Customer_ID!, +Vendor_ID!, count,meal.Meal_ID,meal.Price*count)
                            if(warning===0){
                                alert('現在時刻已超過預定時間，請重新預定!');
                                window.location.reload();
                            }
                            else if(warning===1){
                                alert('您選擇的餐點數量為零或已超過當下庫存量，請重新選擇數量!');
                                window.location.reload();
                            }else{
                                alert('已加入購物車!');
                                //window.location.reload();
                                setCount(0);
                            }
                            }}>
                            加入購物車
                        </button>
                    </div>
                </div>
                <div className={style.Meal_imgBox} >
                    <img src={meal.Image_url} className={style.Meal_img} alt={meal.Meal_Name} />
                </div>
            </div>
        );
    }
    
}