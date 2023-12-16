import type { Meal } from '../../type'
import style from '../../style/Meal/AllMealMealItem.module.css'
import Counter from '../shared/Counter'
import { BACKEND_URL } from '../../constant'
import { useState } from 'react'
import BaseButton from '../shared/BaseButton'
import BaseButtonRed from '../shared/BaseButtonRed'

const updateOnClick = (meal: Meal, count: number, updateMeals: any) => {

  const update_url = `${BACKEND_URL}/allMeals/updateDefaultInventory`;
  fetch(update_url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mealId: meal.Meal_ID, count: count })
  }).then((res) => {
    if (!res.ok){
      console.log(res.status);
      throw new Error('Network response was not ok');
    }
    alert(`${meal.Meal_Name} 預設庫存更新成功！`);
  }).then(() => { 
    meal.Default_Inventory = count;
    updateMeals(meal);
  })
    .catch((err) => {
      console.log(err);
      alert("Network error :(");
    });
}

const setZeroOnClick = (meal: Meal, setCount: React.Dispatch<React.SetStateAction<number>>,
                        updateMeals: any) => {

  const update_url = `${BACKEND_URL}/allMeals/updateDefaultInventory`;
  fetch(update_url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mealId: meal.Meal_ID, count: 0})
  }).then((res) => {
    if (!res.ok){
      console.log(res.status);
      throw new Error('Network response was not ok');
    }
    alert(`${meal.Meal_Name} 下架成功！`);
  }).then(() => { 
    setCount(0);
    meal.Default_Inventory = 0;
    updateMeals(meal);
  })
    .catch((err) => {
      console.log(err);
      alert("Network error :(");
    });
}

export default function AllMealMealItem({ meal, updateMeals }: {meal: Meal, updateMeals: any}) {
  const [count, setCount] = useState(meal.Default_Inventory);

  return (
    <div className={style.allMealMealItem_item}>
        <div className={style.allMealMealItem_contentContainer}>
            <span className={style.allMealMealItem_mealName}>{meal.Meal_Name}</span>
            <span className={style.allMealMealItem_price}>NT${meal.Price}</span>
        </div>

        <div className={style.allMealMealItem_otherContainer}>
          <div className={style.allMealMealItem_allButtonBox}>
            <div className={style.allMealMealItem_buttonBox}>
              <BaseButton text="更新庫存" onClickFunc={() => updateOnClick(meal, count, updateMeals)}/>
            </div>
            <div className={style.allMealMealItem_buttonBox}>
              <BaseButtonRed text="下架" onClickFunc={() => setZeroOnClick(meal, setCount, updateMeals)}/>
            </div>
          </div>
          <div className={style.allMealMealItem_counterBox}>
            <div className={style.allMealMealItem_counter}>
              <Counter count={count} setCount={setCount} />
            </div>
            <div className={style.allMealMealItem_counterDescription}>預設庫存：</div>
          </div>
          
        </div>

        <div className={style.allMealMealItem_imgBox}>
          <img src={`${meal.Image_url}`} className={style.allMealMealItem_img} alt={meal.Meal_Name} />
          {/* <img src={`https://mealorder.blob.core.windows.net/image/dumplings.jpg`} className={style.allMealMealItem_img} alt={meal.Meal_Name} /> */}
        </div>
    </div>
  );
}