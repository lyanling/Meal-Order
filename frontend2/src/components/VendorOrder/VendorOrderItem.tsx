import type { CustomerOrder, CustomerOrderContent } from '../../type'
import style from '../../style/Order/OrderItem.module.css'
import { BACKEND_URL } from '../../constant'
import { useState, useEffect } from "react";
import OrderInfoItem from "./VendorOrderInfoItem";
import OrderContentItem from "./VendorOrderContentItem";
import Orders from '../../pages/Orders';

export default function OrderItem({ order, confirmOrder, finishOrder, cancelConfirm, pickupConfirm }: 
    { order: CustomerOrder, confirmOrder: (orderID: number) => any, finishOrder: (orderID: number) => any, cancelConfirm: (orderID: number) => any, pickupConfirm: (orderID: number) => any }) 
    {
    const [order_meals, setOrderMeal] = useState<CustomerOrderContent[]>([]);
    const [disclosure, setDisclosure] = useState(false);
    const [bulk_order, setBulkOrder] = useState(false);

    const handleDisclosureClick = () => {
        setDisclosure(!disclosure);
    };

    useEffect(() => {
        async function fetchOrderMeals() {
            let order_meal_ids: Array<number> = [];
            let total_meal_amount = 0;
            order.Meal_List.forEach((order_meal) => {
                order_meal_ids.push(order_meal.Meal_ID);
                total_meal_amount += order_meal.Amount;
            });
            // console.log("[OrderItem: fetchOrderMeals] orderMealIDs = ", orderMealIDs);
            setBulkOrder((total_meal_amount >= 20)? true : false);
            try {
                const res = await fetch(
                    BACKEND_URL + `/vendor/orderMeals?orderMealIDs=${order_meal_ids}`
                ).then(res => { return res.json(); });
                setOrderMeal(res);
                // console.log("[fetchOrderMeals] order_meals: ", order_meals);
            } catch (e) {
                console.log("Error fetching all_orders from backend: ", e);
            }
        };
        fetchOrderMeals();
    }, [order.Meal_List]);

    return (
        <div className={style.orderItem_container}>
            <div className={style.orderItem_infoItemBox}>
                <OrderInfoItem
                    key={order.Order_ID} 
                    order={order}
                    handleDisclosureClick={handleDisclosureClick} 
                    disclosure={disclosure}
                    bulk_order={bulk_order}
                    confirmOrder={confirmOrder} 
                    finishOrder={finishOrder} 
                    cancelConfirm={cancelConfirm}
                    pickupConfirm={pickupConfirm}
                />
            </div>
            <div>
                {disclosure ?
                    <div className={style.orderItem_mealContainer}>
                        {order_meals.length > 0 ? (
                            <div className={style.orderItem_mealItemBox}>
                                {order_meals.map((order_meal, index) => (
                                    <OrderContentItem key={order_meal.Meal_ID} orderContent={order_meal} amount={order.Meal_List[index].Amount} />
                                ))}
                            </div>
                        ) : (
                            <div className="orderMeals_empty">\
                                <span className="orderMeals_empty_title">Error: No meals in this order.</span>
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