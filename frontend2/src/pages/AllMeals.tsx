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

    const sortMeal = (meals: any[]) => {
        let sortable = [];
        for (var i = 0; i < meals.length; i++) {
            sortable.push([meals[i].Default_Inventory, meals[i]]);
        }
        sortable.sort(function(a, b) {
            return b[0] - a[0];
        });
        let sorted_meals = [];
        for (var i = 0; i < sortable.length; i++){
            sorted_meals.push(sortable[i][1]);
        }
        return sorted_meals;
    }

    const updateMeals = (newMeal: Meal) => {
        // Update meal if meal is in meals
        setMeals(prevMeals => 
            prevMeals.map(meal => 
              meal.Meal_ID === newMeal.Meal_ID
                ? newMeal : meal
            )
        );
        setMeals(prevMeals => 
            [...prevMeals].sort((a, b) => b.Default_Inventory - a.Default_Inventory)
        );
        // console.log("updated meals = ", meals);
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(
                    BACKEND_URL + `/allMeals?vendorId=${vendorId}`
                ).then(res => { return res.json(); });
                
                
                const sorted_meals = sortMeal(res);
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
                    <AllMealMealItem key={meal.Meal_ID} meal={meal} updateMeals={updateMeals}/>
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