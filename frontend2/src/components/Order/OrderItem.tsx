import { OrderStatus, type CustomerOrder, type CustomerOrderContent } from '../../type'
import style from '../../style/Order/OrderItem.module.css'
import triangle_style from '../../style/Order/TriangleButton.module.css'
import { BACKEND_URL } from '../../constant'
import { useState, useEffect } from "react";
import OrderInfoItem from "./OrderInfoItem";
import OrderContentItem from "./OrderContentItem";

export default function OrderItem({ order, handleOrderCancellation }: 
    { order: CustomerOrder, handleOrderCancellation: (order_id: number) => any }) {
    const [order_meal_ids, setOrderMealIDs] = useState<Array<number>>([]);
    const [order_meals, setOrderMeal] = useState<CustomerOrderContent[]>([]);
    const [disclosure, setDisclosure] = useState(false);
    const [bulk_order, setBulkOrder] = useState(false);
    const [order_pickup_time, setOrderPickupTime] = useState<Date>(new Date());
    const [order_cancel_dl, setOrderCancelDL] = useState<Date>(new Date());
    const [can_cancel, setCanCancel] = useState(true);
    const [order_status, setOrderStatus] = useState<"IN_PROGRESS" | "COMPLETED">("IN_PROGRESS");

    /* disclosure clicked */
    const handleDisclosureClick = () => {
        setDisclosure(!disclosure);
    };

    /* check if the order can be cancelled -> if true: cancel order */
    async function handleCancelButtonClick() {
        let cur_time = new Date();
        let checkCancelAgain = cur_time.getTime() < order_cancel_dl.getTime();
        if (checkCancelAgain === true) {
            const response = window.confirm(`確定要取消訂單 #${order.Order_ID} 嗎?`);
            if (response) {
                // alert(`成功取消訂單 #${order.Order_ID}`);
                handleOrderCancellation(order.Order_ID);
            }
        }
    }

    /* set order info */
    useEffect(() => {
        function initOrderMealIDs() {
            let tmp: Array<number> = [];
            let total_meal_amount = 0;
            order.Meal_List.forEach((order_meal) => {
                tmp.push(order_meal.Meal_ID);
                total_meal_amount += order_meal.Amount;
            });
            setOrderMealIDs(tmp);
            return total_meal_amount;
        }
        const total_meal_amount = initOrderMealIDs();
        setBulkOrder((total_meal_amount >= 20) ? true : false);
        setOrderPickupTime(new Date(order.Pickup_Time));
    }, [order]);

    /* check order_status & determine cancel deadline */
    useEffect(() => {
        function checkOrderStatus() {
            if (order.Status === OrderStatus.WAIT_FOR_APPROVAL
                || order.Status === OrderStatus.PREPARING
                || order.Status === OrderStatus.READY_FOR_PICKUP) {
                setOrderStatus("IN_PROGRESS");
            }
            else { /* PICKED_UP, CANCELLED_UNCHECKED, CANCELLED_CHECKED */
                setOrderStatus("COMPLETED");
            }
        }

        function calOrderCancelDL() {
            let tmp: Date = new Date(order_pickup_time);
            if (bulk_order === true) {
                tmp.setHours(order_pickup_time.getHours() - 24);
            }
            else {
                tmp.setHours(order_pickup_time.getHours() - 1);
            }
            setOrderCancelDL(tmp);
        }
        checkOrderStatus();
        calOrderCancelDL();
    }, [order, bulk_order, order_pickup_time]);

    /* determine if this order can be cancelled (according to the order_status and cancel deadline ) */
    useEffect(() => {
        function checkCanCancel() {
            let cur_time = new Date();
            setCanCancel(order_status === "IN_PROGRESS" && cur_time.getTime() < order_cancel_dl.getTime());
        }

        checkCanCancel();
    }, [order_cancel_dl, order_status]);

    /* fetch order meals */
    useEffect(() => {
        async function fetchOrderMeals() {
            let res;
            try {
                const url: string = BACKEND_URL + "/orders/orderMeals";
                res = await fetch(url, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json", },
                    body: JSON.stringify({
                        orderMealIDs: order_meal_ids
                    })
                }).then((res) => { return res.json() });
            } catch (e) {
                console.log("Error fetching all_orders from backend: ", e);
                throw e;
            }
            setOrderMeal(res);
        };

        const abortController = new AbortController();
        fetchOrderMeals();
        return () => {
            abortController.abort();
        }
    }, [order, order_meal_ids]);

    /* render different content depend on order.Status */
    function orderStatusInfoRenderSwitch() {
        switch (order.Status) {
            case OrderStatus.WAIT_FOR_APPROVAL:
            case OrderStatus.PREPARING:
                return (
                    <span className={style.orderItem_orderStatus_inProgress}>
                        餐點製作中
                    </span>);
            case OrderStatus.READY_FOR_PICKUP:
                return (
                    <span className={style.orderItem_orderStatus_inProgressReady}>
                        等待取餐中
                    </span>);
            case OrderStatus.PICKED_UP:
                return (
                    <span className={style.orderItem_orderStatus_Completed}>
                        訂單已完成
                    </span>);
            default:
                return (
                    <span className={style.orderItem_orderStatus_CompletedCancelled}>
                        訂單已取消
                    </span>);
        }
    }

    return (
        <div className={style.orderItem_container}>
            {/* order info & [cancel button / order status] */}
            <div className={style.orderItem_infoItemAndButtonContainer}>
                {/* order info */}
                <div className={style.orderItem_infoItemContainer}>
                    <OrderInfoItem
                        order_id={order.Order_ID}
                        vendor_id={order.Vendor_ID}
                        vendor_name={order.Vendor_Name}
                        order_status={order_status}
                        order_pickup_time={order_pickup_time}
                        order_cancel_dl={order_cancel_dl}
                        can_cancel={can_cancel}
                    />
                </div>

                {/* [cancel button / order status] & total price */}
                <div className={style.orderItem_buttonAndPriceContainer}>

                    {/* cancel button / order status */}
                    <div className={style.orderItem_cancelAndStatusBox}>
                        { can_cancel ?
                            <button className={style.orderItem_cancelButton} onClick={() => handleCancelButtonClick()}>
                                <span>取消訂單</span>
                            </button>
                            :
                            <div className={style.orderItem_orderStatus}>
                                {orderStatusInfoRenderSwitch()}
                            </div>
                        }
                    </div>
                    
                    {/* total price & disclosure button */}
                    <div className={style.orderItem_totalPriceAndDetail}>
                        <span>{`總計：NT$${order.Cash_Amount}`}</span>
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

            {/* order meals */}
            <div>
                {/* disclosure button -> show / not show */}
                {disclosure ?
                    <div className={style.orderItem_mealContainer}>
                        {order_meals.length > 0 ? (
                            <div className={style.orderItem_mealItemBox}>
                                {order_meals.map((order_meal, index) => (
                                    <OrderContentItem key={order_meal.Meal_ID} orderContent={order_meal} amount={order.Meal_List[index].Amount} />
                                ))}
                            </div>
                        ) : (
                            <div className="orderMeals_empty">
                                <span className="orderMeals_empty_title">獲取訂單資訊中...</span>
                            </div>
                        )}
                    </div>
                    :
                    <></>
                }
            </div>
        </div>
        
    );
}