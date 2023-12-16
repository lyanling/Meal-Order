import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { Meal } from '../type'
import AllMealMealItem from "../components/Meal/AllMealMealItem";
import AllMealAddMealItem from "../components/Meal/AllMealAddMealItem";
import { BACKEND_URL } from '../constant'
import style from '../style/Meal/AllMeal.module.css'

export default function AllMeals() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const { vendorId } = useParams();

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(
                    BACKEND_URL + `/allMeals?vendorId=${vendorId}`
                ).then(res => { return res.json(); });
                
                // sort
                let sortable = [];
                for (var i = 0; i < res.length; i++) {
                    sortable.push([res[i].Default_Inventory, res[i]]);
                }
                sortable.sort(function(a, b) {
                    return b[0] - a[0];
                });
                let sorted_meals = [];
                for (var i = 0; i < sortable.length; i++){
                    sorted_meals.push(sortable[i][1]);
                }
                // console.log("sorted_meals = ", sorted_meals);
                setMeals(sorted_meals);

            } catch (e) {
                console.log("Error fetching all_meals from backend: ", e);
            }
        };
        fetchData();
    }, []);

    return (
        <>
        <div className={style.meal_container}>
            {/* Render items */}
            {meals.length > 0 ? (
                <div className={style.meal_itemBox}>
                    {meals.map((meal) => (
                    <AllMealMealItem key={meal.Meal_ID} meal={meal} />
                    ))}

                    <AllMealAddMealItem setMeals={setMeals}/>
                </div>
            ) : (
                <div className="all_meals_empty">
                    <span className="all_meals_empty_title">No meals.</span>
                    <AllMealAddMealItem setMeals={setMeals}/>
                </div>
                
            )}
        </div>

        

        </>
    );
    
}