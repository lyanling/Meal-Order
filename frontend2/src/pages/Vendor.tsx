import { useParams, useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { CustomerOrder } from '../type'
import { BACKEND_URL } from '../constant'
import style from '../style/Vendor/Vendor.module.css'
import VendorOrderTab from "../components/VendorOrder/VendorOrderTab";
import { WebSocketHook } from "react-use-websocket/dist/lib/types";

const Today = new Date();

const weekday =['週日', '週一', '週二', '週三', '週四', '週五', '週六']; 

const DayArray = new Array();

for (let step = 0; step < 3; step++){
    let day = new Date(Today);
    day.setDate(day.getDate() + step);
    DayArray.push(day);
}
  

export default function Vendor() {
    const params = useParams();
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(((new Date()).getFullYear()).toString() + " 年 " + ((new Date()).getMonth()+1).toString() + " 月 " + (new Date()).getDate().toString() + " 日 " + weekday[(new Date().getDay())]);
    const vendor_id = params.vendorId;
    const { sendJsonMessage, lastJsonMessage } = useOutletContext<WebSocketHook<CustomerOrder>>();

    async function confirmOrder(Order_ID: number) {
        const response = window.confirm(`已接取訂單，訂單編號: #${Order_ID}`);
        if(!response) return;
        fetch(BACKEND_URL + `/vendor/confirmOrder`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({"orderID" : Order_ID})
        }).then((res) => res.json())
          .catch((err) => console.log(err));
        setOrders(orders.map(order => {
            if(order.Order_ID === Order_ID) {
                order.Status = "PREPARING";
            }
            return order;
        }));
    }
    async function finishOrder(Order_ID: number) {
        fetch(BACKEND_URL + `/vendor/finishOrder`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({"orderID" : Order_ID})
        }).then((res) => res.json())
          .catch((err) => console.log(err));
        setOrders(orders.map(order => {
            if(order.Order_ID === Order_ID) {
                order.Status = "READY_FOR_PICKUP";
            }
            return order;
        }));
    }
    async function cancelConfirm(Order_ID: number) {
        const response = window.confirm(`確定訂單已取消 訂單編號: #${Order_ID}`);
        if(!response) return;
        fetch(BACKEND_URL + `/vendor/cancelConfirm`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({"orderID" : Order_ID})
        }).then((res) => res.json())
          .catch((err) => console.log(err));
        setOrders(orders.map(order => {
            if(order.Order_ID === Order_ID) {
                order.Status = "CANCELLED_CHECKED";
            }
            return order;
        }));
    }
    async function pickupConfirm(Order_ID: number) {
        const response = window.confirm(`確定客戶已取餐 訂單編號: #${Order_ID}`);
        if(!response) return;
        fetch(BACKEND_URL + `/vendor/pickupConfirm`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({"orderID" : Order_ID})
        }).then((res) => res.json())
          .catch((err) => console.log(err));
        setOrders(orders.map(order => {
            if(order.Order_ID === Order_ID) {
                order.Status = "PICKED_UP";
            }
            return order;
        }));
    }
    
    useEffect(() => {
        if(lastJsonMessage) {
            if (lastJsonMessage.Status === "WAIT_FOR_APPROVAL") {
                // 新增訂單
                const PickupDate = +(lastJsonMessage.Pickup_Time.split('T')[0]).split('-')[2];
                const CurrentDate = +selectedDate.split(' ')[4];
                if(PickupDate === CurrentDate) {
                    setOrders([...orders, lastJsonMessage]);
                }     
            }
            else if (lastJsonMessage.Status === "CANCELLED_UNCHECKED") {
                // 取消訂單
                setOrders(orders.map(order => {
                    return order.Order_ID === lastJsonMessage.Order_ID ? lastJsonMessage : order;
                }));
            }
            else {
                // 未知的操作
            }
        }
    }, [lastJsonMessage]);

    useEffect(() => {
        async function fetchOrders(vendorId: string, day: string) {
            try {
                const arr = day.split(' ')
                const year = +arr[0], month = +arr[2], date = +arr[4];
                const url: string = BACKEND_URL + `/vendor?vendorId=${vendorId}&year=${year}&month=${String(month).padStart(2, '0')}&date=${String(date).padStart(2, '0')}`;
                const res = await fetch(url).then(res => { return res.json(); });
                setOrders(res);
            } catch (e) {
                console.log("Error fetching all_orders from backend: ", e);
            }
        };
        fetchOrders(vendor_id!, selectedDate);
    }, [vendor_id, selectedDate]);

    return (
        <div>
            <h1> 我的訂單 </h1>            
            <select className={style.DropDown} 
                    onChange={e => {
                        let ele = e.target.value;
                        setSelectedDate(((new Date(ele)).getFullYear()).toString() + " 年 " + ((new Date(ele)).getMonth()+1).toString() + " 月 " + (new Date(ele)).getDate().toString() + " 日 " + weekday[(new Date(ele).getDay())]);
                    }}> 
                {DayArray.map(ele => (
                    <option value={ele} key={ele}>
                        {((new Date(ele)).getFullYear()).toString() + " 年 " + ((new Date(ele)).getMonth()+1).toString() + " 月 " + (new Date(ele)).getDate().toString() + " 日 " + weekday[(new Date(ele).getDay())]}
                    </option>))
                }
            </select>
            <VendorOrderTab orders={orders} confirmOrder={confirmOrder} finishOrder={finishOrder} cancelConfirm={cancelConfirm} pickupConfirm={pickupConfirm} />
        </div>
    );
}