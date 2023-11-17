import type { Meal } from '../../type'
import test_img from '../../assets/dumplings.jpg'
import style from '../../style/Order/OrderMealItem.module.css'
import Counter from '../shared/Counter'
import { Link } from "react-router-dom";
import { BACKEND_URL } from '../../constant'

export default function OrderMealItem({ meal, vendorId }: { meal: Meal, vendorId: any }) {
    return (
        <div className={style.orderMealItem_item}>
            <div className={style.orderMealItem_contentContainer}>
                <span className={style.allMealMealItem_title}>{meal.Meal_Name}</span>
                {/* TODO: price / number or amount */}
                {/* <span>{(meal.price * meal.count).toLocaleString()} تومان</span> */}
            </div>

            {/* <div className={style.allMealMealItem_otherContainer}>
                <div className={style.allMealMealItem_updateBox}>
                    <Link to={`${BACKEND_URL}/allMeals/updateDefaultInventory?vendorId=${vendorId}&count=${1}`}>
                        <div className={style.allMealMealItem_updateButton}>
                            <span>更新</span>
                        </div>
                    </Link>
                </div>
                <div className={style.allMealMealItem_counterBox}>
                    <div className={style.allMealMealItem_counter}>
                        <Counter _count={meal.Default_Inventory} />
                    </div>
                    <div>
                        <p>預設庫存：</p>
                    </div>
                </div>

            </div> */}

            <div className={style.allMealMealItem_img}>
                <img src={test_img} alt={meal.Meal_Name} />
                {/* TODO: change to meal.Image_url */}
                {/* <img src={meal.Image_url} alt={meal.Meal_Name} /> */}
            </div>
        </div>
    );
}