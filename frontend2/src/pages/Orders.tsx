import { useParams, useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { OrderStatus, CustomerOrder } from '../type'
import { BACKEND_URL } from '../constant'
import OrderTab from "../components/Order/OrderTab";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { WebSocketHook } from 'react-use-websocket/dist/lib/types';

export default function Orders() {
    const params = useParams();
    const [display, setDisplay] = useState(0); // 0: in progress, 1: completed
    const [orders_completed, setOrdersCompleted] = useState<CustomerOrder[]>([]);
    const [orders_in_progress, setOrdersInProgress] = useState<CustomerOrder[]>([]);
    const customer_id = params.customerId;
    const [completed_order_time, setCompletedOrderTime] = useState("");
    const [orders_in_progress_feteched, setOrdersInProgressFetched] = useState<boolean>(false);
    const [orders_completed_feteched, setOrdersCompletedFetched] = useState<boolean>(false);
    const { sendJsonMessage, lastJsonMessage, readyState } = useOutletContext<WebSocketHook<CustomerOrder>>();

    /* tab_list clicked */
    function changeTab(tab: number) {
        if (tab !== display) {
            setDisplay(tab);
        }
    }

    async function updateOrders(order_id: number) {
        function updateOrdersCompleted(order_id: number) {
            let order_cancelled: CustomerOrder | undefined = orders_in_progress.find((order) => order.Order_ID === order_id);
            if (order_cancelled !== undefined) {
                order_cancelled.Status = OrderStatus.CANCELLED_UNCHECKED;
                let new_orders_completed = [order_cancelled, ...orders_completed];
                new_orders_completed.sort((a: CustomerOrder, b: CustomerOrder) => b.Order_ID - a.Order_ID);
                setOrdersCompleted(new_orders_completed);
            }
            return order_cancelled;
        }

        function updateOrdersInProgress(order_id: number) {
            let filteredArray = orders_in_progress.filter(order => order.Order_ID !== order_id)
            filteredArray.sort((a: CustomerOrder, b: CustomerOrder) => b.Order_ID - a.Order_ID);
            setOrdersInProgress(filteredArray);
        }

        const order_cancelled: CustomerOrder | undefined = await updateOrdersCompleted(order_id);
        updateOrdersInProgress(order_id);
        return order_cancelled;
    };

    /* cancel order & re-render */
    async function cancelOrder(order_id: number) {
        async function toCancelOrder(order_cancelled: CustomerOrder | undefined) {
            let success = false;
            if (order_cancelled !== undefined) {
                try {
                    const url: string = BACKEND_URL + `/orders/cancelOrder?orderID=${order_cancelled?.Order_ID}`;

                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { "Content-Type": "application/json", },
                        body: JSON.stringify({
                            order: order_cancelled
                        })
                    }).then(res => { return res.json(); }); // changedRows

                    success = res > 0;
                } catch (e) {
                    console.log("Error: cancel order from backend: ", e);
                }
            }
            // return success;
        }

        function notifyCancellationToVendor(order_cancelled: CustomerOrder | undefined) {
            if (order_cancelled !== undefined) {
                sendJsonMessage({
                    Order_ID: order_cancelled.Order_ID,
                    Vendor_ID: order_cancelled.Vendor_ID,
                    Customer_ID: order_cancelled.Customer_ID,
                    Status: order_cancelled.Status,
                    Pickup_Time: order_cancelled.Pickup_Time,
                    Meal_List: order_cancelled.Meal_List,
                    Cash_Amount: order_cancelled.Cash_Amount,
                    Vendor_Name: order_cancelled.Vendor_Name
                });
            }
        }

        /* update orders */
        const order_cancelled: CustomerOrder | undefined = await updateOrders(order_id);

        /* cancel (notify Vendor & write db) */
        notifyCancellationToVendor(order_cancelled);
        toCancelOrder(order_cancelled);
    }

    /* Set the date_time one month ago in mysql format */
    useEffect(() => {
        const toSqlDatetime = (inputDate: Date) => {
            const date = new Date(inputDate)
            const dateWithOffest = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
            return dateWithOffest
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ')
        }

        let oneMonthAgo = new Date();
        oneMonthAgo.setMonth(new Date().getMonth() - 1);
        setCompletedOrderTime(toSqlDatetime(oneMonthAgo));
    }, []);

    /* fetch orders in progress */
    useEffect(() => {

        async function fetchOrdersInProgress() {
            if (display === 0 && orders_in_progress_feteched === false) {

                const url: string = BACKEND_URL + "/orders";
                let res;
                try {
                    res = await fetch(url, {
                        method: 'POST',
                        headers: { "Content-Type": "application/json", },
                        body: JSON.stringify({
                            customerID: customer_id,
                            display: display,
                            completed_order_time: ""
                        })
                    }).then((res) => { return res.json() });
                } catch (e) {
                    console.log("Error fetching all_orders from backend: ", e);
                    throw e;
                }
                // console.log("orders_in_progress fetched!");
                res.sort((a: CustomerOrder, b: CustomerOrder) => b.Order_ID - a.Order_ID);
                setOrdersInProgress(res);
                setOrdersInProgressFetched(true);
            }
        };

        const abortController = new AbortController();
        fetchOrdersInProgress();
        return () => {
            abortController.abort();
        }
    }, [customer_id, display, orders_in_progress_feteched]);

    /* fetch orders completed */
    useEffect(() => {

        async function fetchOrdersCompleted() {
            if (display === 1 && completed_order_time.length > 0 && orders_completed_feteched === false) {

                const url: string = BACKEND_URL + "/orders";
                let res;
                try {
                    res = await fetch(url, {
                        method: 'POST',
                        headers: { "Content-Type": "application/json", },
                        body: JSON.stringify({
                            customerID: customer_id,
                            display: display,
                            completed_order_time: completed_order_time
                        })
                    }).then((res) => { return res.json() });
                } catch (e) {
                    console.log("Error fetching all_orders from backend: ", e);
                    throw e;
                }
                // console.log("orders_completed fetched!");
                res.sort((a: CustomerOrder, b: CustomerOrder) => b.Order_ID - a.Order_ID);
                setOrdersCompleted(res);
                setOrdersCompletedFetched(true);
            }
        };

        const abortController = new AbortController();
        fetchOrdersCompleted();
        return () => {
            abortController.abort();
        }
    }, [customer_id, display, completed_order_time, orders_completed_feteched]);

    /* determine the tab's style */
    function tabListStyleSwitch(tab_id: number) {
        const styleTabListChosen = {
            color: "black",
            fontWeight: "bold",
            backgroundColor: "gainsboro"
        };

        const styleTabListUnchosen = {
            color: "black",
            fontWeight: "bold",
        };

        if (tab_id === display) return styleTabListChosen;
        else return styleTabListUnchosen;
    }

    return (
        <>
            <h1> 我的訂單 </h1>
            <Tabs>
                <TabList>
                    <Tab style={ tabListStyleSwitch(0) } onClick={() => changeTab(0)}>進行中</Tab>
                    <Tab style={ tabListStyleSwitch(1) } onClick={() => changeTab(1)}>近期完成</Tab>
                </TabList>

                <TabPanel>
                    <OrderTab key={0} orders={orders_in_progress} handleOrderCancellation={cancelOrder} />
                </TabPanel>
                <TabPanel>
                    <OrderTab key={1} orders={orders_completed} handleOrderCancellation={cancelOrder} />
                </TabPanel>
            </Tabs>
            
        </>
    );
}