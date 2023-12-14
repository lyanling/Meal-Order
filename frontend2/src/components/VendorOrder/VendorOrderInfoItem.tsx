import type { CustomerOrder, OrderTimeInfo } from '../../type'
import { BACKEND_URL } from '../../constant'
import style from '../../style/Vendor/VendorOrderInfoItem.module.css'
import triangle_style from '../../style/Order/TriangleButton.module.css'
import { useState, useEffect } from "react";

export default function OrderInfoItem({ order, handleDisclosureClick, disclosure, bulk_order, confirmOrder, finishOrder, cancelConfirm, pickupConfirm }: 
    { 
    order: CustomerOrder, handleDisclosureClick: () => any, disclosure: boolean, bulk_order: boolean,
    confirmOrder: (orderID: number) => any, finishOrder: (orderID: number) => any, cancelConfirm: (orderID: number) => any, pickupConfirm: (orderID: number) => any
    }) {
    const [pickup_time_str, setPickupTimeStr] = useState("");
    const [cancel_dl_str, setCancelDLStr] = useState("");

    // async function confirmOrder() {
    //     fetch(BACKEND_URL + `/vendor/confirmOrder`, {
    //         method: 'POST',
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({"orderID" : order.Order_ID})
    //     }).then((res) => res.json())
    //       .catch((err) => console.log(err));
    //     const response = window.confirm(`已接取訂單 #${order.Order_ID}`);
    //     //window.location.reload()
    // }
    // async function finishOrder() {
    //     fetch(BACKEND_URL + `/vendor/finishOrder`, {
    //         method: 'POST',
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({"orderID" : order.Order_ID})
    //     }).then((res) => res.json())
    //       .catch((err) => console.log(err));
    //     //window.location.reload()
    // }
    // async function cancelConfirm() {
    //     fetch(BACKEND_URL + `/vendor/cancelConfirm`, {
    //         method: 'POST',
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({"orderID" : order.Order_ID})
    //     }).then((res) => res.json())
    //       .catch((err) => console.log(err));
    //     //window.location.reload()
    // }
    // async function pickupConfirm() {
    //     fetch(BACKEND_URL + `/vendor/pickupConfirm`, {
    //         method: 'POST',
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({"orderID" : order.Order_ID})
    //     }).then((res) => res.json())
    //       .catch((err) => console.log(err));
    //     //window.location.reload()
    // }

    useEffect(() => {

        function buildTimeInfo(date_time: Date) {
            const DAYS: Array<string> = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
            let time_info: OrderTimeInfo = {
                year: date_time.getFullYear().toString(),
                month: (date_time.getMonth() + 1).toString(),
                date: (date_time.getDate()).toString(),
                day: DAYS[date_time.getDay()],
                hour: ((date_time.getHours() > 12) ?
                    date_time.getHours() - 12 : date_time.getHours()).toString(),
                minute: (date_time.getMinutes() == 0)? "00" : date_time.getMinutes().toString(),
                dayPeriod: (date_time.getHours() > 12) ? "下午" : "上午",
            };
            return time_info;
        };

        function buildPickupTimeTimeInfo(order_pickup_time: Date) {
            return buildTimeInfo(order_pickup_time);
        };
        
        function buildCancelDLTimeInfo(order_pickup_time: Date) {
            let order_cancel_dl: Date = order_pickup_time;
            if (bulk_order === true) {
                order_cancel_dl.setHours(order_pickup_time.getHours() - 24);
            }
            else {
                order_cancel_dl.setHours(order_pickup_time.getHours() - 1);
            }
            return buildTimeInfo(order_cancel_dl);
        };

        function buildTimeStr(time_info: OrderTimeInfo) {
            return `${time_info.year} 年 ${time_info.month} 月 ${time_info.date} 日 ${time_info.day}, ${time_info.dayPeriod} ${time_info.hour}:${time_info.minute}`;
        }

        let order_pickup_time: Date = new Date(order.Pickup_Time);
        let pickup_time: OrderTimeInfo = buildPickupTimeTimeInfo(order_pickup_time);
        let cancel_dl: OrderTimeInfo = buildCancelDLTimeInfo(order_pickup_time);
        setPickupTimeStr(buildTimeStr(pickup_time));
        setCancelDLStr(buildTimeStr(cancel_dl));
    }, [order, bulk_order, pickup_time_str, cancel_dl_str]);

    return (
        <div className={style.orderInfoItem_item}>
            <div className={style.orderInfoItem_leftContainer}>
                <span className={style.orderInfoItem_title}>{'訂單編號 #' + order.Order_ID}</span>
                <span className={style.orderInfoItem_note}>{'取餐時間：' + pickup_time_str}</span>
            </div>

            <div className={style.orderInfoItem_rightContainer}>
                <div className={style.orderInfoItem_confirmBox}>
                    <button className={style.orderInfoItem_confirmButton} onClick={() => {
                        if(order.Status === 'WAIT_FOR_APPROVAL') {
                            confirmOrder(order.Order_ID);
                        } else if(order.Status === 'PREPARING') {
                            finishOrder(order.Order_ID);
                        } else if (order.Status === 'CANCELLED_UNCHECKED') {
                            cancelConfirm(order.Order_ID);
                        } else if (order.Status === 'READY_FOR_PICKUP') {
                            pickupConfirm(order.Order_ID);
                        }
                    }}>
                        <span>{(order.Status === 'WAIT_FOR_APPROVAL') ? "接單" : 
                               (order.Status === 'PREPARING') ? "完成餐點" :
                               (order.Status === 'CANCELLED_UNCHECKED') ? "客戶已取消" :
                               (order.Status === 'READY_FOR_PICKUP') ? "客戶取餐" : ""}</span>
                    </button>
                </div>
                <div className={style.orderInfoItem_detail}>
                    <span>{'總計: NT$' + order.Cash_Amount}</span>
                    <button className={triangle_style.triangle_buttons} onClick={() => handleDisclosureClick()}>
                        {disclosure ?
                            <div className={`${triangle_style.triangle_buttons__triangle} ${triangle_style.triangle_buttons__triangle_b}`}></div>
                            :
                            <div className={`${triangle_style.triangle_buttons__triangle} ${triangle_style.triangle_buttons__triangle_l}`}></div>
                        }
                    </button>
                </div>
            </div>
        </div>

    );
}