/**
 * About the Meal Block in ShopCart Page
 */

import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from "react-router-dom";
import MealItem from './MealItem_ShopCart';
import { CustomerOrderDetail } from '../../type'
import { BACKEND_URL } from '../../constant';
import style from '../../style/OrderMeal-ShopCart/ShopCart.module.css'
import { WebSocketHook } from 'react-use-websocket/dist/lib/types';
import { CustomerOrder } from '../../type';

export default function MealBlock({ Order_ID, intime }: { Order_ID: number, intime: boolean }) {
    const params = useParams();
    const customerId = params.customerId;
    const [vendorName, setvendorName] = useState('');
    const [pickupTime, setPickupTime] = useState(new Date());
    const [cashAmount, setcashAmount] = useState(0);
    const [mealList, setMealList] = useState<CustomerOrderDetail[]>([]);
    const [vendor_id, setvendor_id] = useState(0);
    let warning: number;
    const { sendJsonMessage, lastJsonMessage, readyState } = useOutletContext<WebSocketHook<CustomerOrder>>();

    /* Backend Function: Submit Order Button */
    const SubmitOrder = async (Order_ID: number, mealshowday: number, Meal_List: CustomerOrderDetail[], cashAmount: number, pickupTime:Date) => {
        const url = `${BACKEND_URL}/ShopCart/SubmitOrder`;
        let msg;
        try {
            msg = await fetch(url, {
                method: 'POST',
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify({
                    Order_ID: Order_ID,
                    mealshowday: mealshowday,
                    Meal_List: Meal_List,
                    Cash_Amount: cashAmount,
                    pickupTime:pickupTime
                })
            }).then((res) => { return res.json() });
        } catch (err) {
            throw err
        }
        warning = msg['msg'];
    }

    /* Backend Function: Delete Order Button */
    const DeleteOrder = async (Order_ID: number) => {
        const url = `${BACKEND_URL}/ShopCart/DeleteOrder`
        try {
            await fetch(url, {
                method: 'POST',
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify({
                    Order_ID: Order_ID
                })
            }).then((res) => { return res.json() });
        } catch (err) {
            throw err;
        }
    }

    /* Initialize the Order Info */
    useEffect(() => {
        const abortController = new AbortController();
        const getOneOrder = async (Order_ID: number) => {
            const url = `${BACKEND_URL}/shopCart/oneorder?Order_ID=${Order_ID}`
            try {
                const result = await fetch(url).then((res) => { return res.json(); })
                setvendorName(result[0]['Name']);
                setPickupTime(new Date(result[0]['Pickup_Time']));
                setMealList(result[0]['Meal_List']);
                setcashAmount(result[0]['Cash_Amount']);
                setMealList(result[0]['Meal_List']);
                setvendor_id(result[0]['Vendor_ID'])
            }
            catch (err) {
                throw err;
            }
        }
        getOneOrder(Order_ID);

        return () => {
            abortController.abort();
        }
    }, [Order_ID])

    /* Generate the showing content */
    let year = pickupTime.getFullYear().toString();
    let month = (pickupTime.getMonth() + 1).toString();
    let date = pickupTime.getDate().toString();
    let day = pickupTime.getDay().toString();
    let daystrArray = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    let hour = pickupTime.getHours();
    let hour_str = '';
    if (hour <= 12) {
        hour_str = '上午 ' + hour.toString();
    }
    else{
        hour_str = '下午 ' + (hour-12).toString();
    }
    let minute = pickupTime.getMinutes().toString();
    if (minute === '0') {
        minute = '00'
    } else {
        minute = minute.toString();
    }

    /* intime: determine whether the pickup time is out-of-date */
    if (intime) {
        return (
            <>
                <div className={style.OneOrder}>
                    <div className={style.InfoAndButton}>
                        <div className={style.OrderInfo}>
                            <div>
                                <h1 className={style.ResName1} >
                                    <Link to={`/customer/${customerId}/vendor/${vendor_id}`} className={style.VendorName}>
                                        {vendorName}
                                    </Link>
                                </h1>
                                <p>
                                    取餐時間：{year} 年 {month} 月 {date} 日 {daystrArray[+day]}, {hour_str}:{minute}
                                </p>
                            </div>
                        </div>
                        <div className={style.button}>
                            <button className={style.Deletebutton} onClick={
                                async () => {
                                    let check = window.confirm('確定一鍵刪除');
                                    if (check) {
                                        DeleteOrder(Order_ID);
                                        window.location.reload();
                                    }
                                }}>一鍵刪除<img src={require('../../assets/delete.png')} height='17vw' alt='delete'></img></button>
                        </div>
                    </div>
                    <div className={style.Meals}>
                        <div>
                            {mealList.map(ele => (
                                <MealItem key={ele['Meal_ID']} Order_ID={Order_ID} mealList={mealList}
                                    setMealList={setMealList} Mealele={ele} mealshowday={(+day === 0) ? 7 : +day} initialcount={ele['Amount']} outofdate={false}
                                    cashAmount={cashAmount} setcashAmount={setcashAmount} />
                            ))}
                        </div>

                    </div>
                    <div className={style.TotalAmount}>
                        <h4>
                            總計：NT${cashAmount}
                        </h4>
                    </div>
                    <div className={style.SendButton}>
                        <div>
                            <div>
                            </div>
                            <button className={style.sendButton} onClick={
                                async () => {
                                    await SubmitOrder(Order_ID, (+day === 0) ? 7 : +day, mealList, cashAmount, pickupTime);
                                    if(warning===0){
                                        alert('現在時刻已超過您的預定時間，請重新點餐!');
                                        window.location.reload();
                                    }
                                    else if (warning===1) {
                                        alert('您所預定的餐點中，有餐點數量已超過當下庫存量或為0');
                                        window.location.reload();
                                    }
                                    else {
                                        sendJsonMessage({
                                            Order_ID: Order_ID,
                                            Vendor_ID: vendor_id,
                                            Customer_ID: customerId,
                                            Status: 'WAIT_FOR_APPROVAL',
                                            Pickup_Time: pickupTime,
                                            Meal_List: mealList,
                                            Cash_Amount: cashAmount,
                                            Vendor_Name: vendorName
                                        });
                                        window.location.reload();
                                    }
                                }}>
                                <img src={require('../../assets/checked.png')} height='17vw' alt='submit' ></img>確認送出
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    else {
        return (
            <div className={style.NotSendOrder}>
                <div className={style.OneOrder}>
                    <div className={style.InfoAndButton}>
                        <div className={style.OrderInfo}>
                            <div>
                                <h1 className={style.ResName}>
                                    <Link to={`/customer/${customerId}/vendor/${vendor_id}`} className={style.VendorName} >
                                        {vendorName}
                                    </Link>(已逾時)
                                </h1>
                                <p>
                                    取餐時間：{year} 年 {month} 月 {date} 日 {daystrArray[+day]}, {hour_str}:{minute}
                                </p>
                            </div>
                        </div>
                        <div className={style.button}>
                            <button className={style.Deletebutton} onClick={() => { 
                                DeleteOrder(Order_ID);
                                window.location.reload();
                                }}>
                                一鍵刪除<img src={require('../../assets/delete.png')} height='17vw' alt='delete' ></img></button>
                        </div>
                    </div>
                    <div className={style.Meals}>
                        <div className={style.test}>
                            {mealList.map(ele => (
                                <MealItem key={ele['Meal_ID']} Order_ID={Order_ID} mealList={mealList}
                                    setMealList={setMealList} Mealele={ele} mealshowday={(+day === 0) ? 7 : +day} initialcount={ele['Amount']} outofdate={true}
                                    cashAmount={cashAmount} setcashAmount={setcashAmount} />
                            ))}
                        </div>
                    </div>
                    <div className={style.TotalAmount}>
                        <h4>
                            總計：NT${cashAmount}
                        </h4>
                    </div>
                    <div className={style.SendButton}>
                        <div >
                            <div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}
