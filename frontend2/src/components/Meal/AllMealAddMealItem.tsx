import type { Meal } from '../../type'
import style from '../../style/Meal/AllMealAddMealItem.module.css'
import Counter from '../shared/Counter'
import { BACKEND_URL } from '../../constant'
import { useEffect, useState } from 'react'
import AddMealButton from './AddMealButton'
import MealText from './MealText';
import { GrAdd } from "react-icons/gr"
import ImageUploading, { ImageListType, ErrorsType } from 'react-images-uploading';
import { useParams } from 'react-router-dom'

const sendNewMealData = async (newMeal: Meal, img: any, setMeals: any ) => {
  const image_url = await sendNewMealImage(img, newMeal, setMeals);
  console.log("image_url = ", image_url);
  newMeal.Image_url = image_url;
  
  const update_url = `${BACKEND_URL}/allMeals/addMealItem`;
  fetch(update_url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({newMeal: newMeal}),
  }).then((res) => res.json())
    .then((data) => {
      // Update Meal_ID & Image_url
      const meal_id = data.meal_id;
      newMeal.Meal_ID = meal_id;
      awaitSetMeals(setMeals, newMeal);
    })
    .catch((err) => console.log(err));
}
const sendNewMealImage = async (img: File, newMeal: Meal, setMeals: any) => {
  const upload_url = `${BACKEND_URL}/allMeals/uploadMealItemImage`;
  let formData = new FormData();
  formData.append('img', img);
  try {
    const response = await fetch(upload_url, {
      method: 'POST',
      headers: {
        
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const returnData = await response.json();
    return returnData.image_url;
  } catch (err) {
    console.error('Error:', err);
    throw err;
}
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const awaitSetMeals = async (setMeals: any, newMeal: Meal) => {
  // Add to meals(state)
  await sleep(500);
  setMeals((prevMeals: any) => [...prevMeals, newMeal]);
}

export default function AllMealAddMealItem({setMeals}: {setMeals: React.Dispatch<React.SetStateAction<Meal[]>>}) {
  const vendorId = useParams().vendorId;
  const [count, setCount] = useState(0);

  const [image, setImages] = useState<ImageListType>([]);
  const uploadImageOnChange = (imageList: ImageListType, addUpdateIndex: any) => {
    // data for submit
    // console.log(imageList, addUpdateIndex);
    setImages(imageList as never[]);
  };

  const uploadImageOnError = (errors: ErrorsType, files: any) => {
    if (errors){
      let errorMessage = errors.maxNumber? "Number of selected images exceed maxNumber" : (
                         errors.acceptType ? "Your selected file type is not allowed" : (
                         errors.maxFileSize ? "Selected file size exceeds maxFileSize" : (
                         errors.resolution ? "Selected file is not match your desired resolution" : 
                          "Some other error occured..."
          )
        )
      );
      alert(errorMessage);
    }
  }

  const [newMealName, setNewMealName] = useState<string>();
  const [newMealPrice, setNewMealPrice] = useState<number>();
  
  const addMealOnClick = () => {
    // Check data validity
    if (typeof newMealName === "undefined")
      alert("餐點名稱不能為空");
    else if (typeof newMealPrice === "undefined")
      alert("餐點價格不能為空");
    else if (newMealPrice < 0)
      alert("餐點價錢不能為負");
    else if (count <= 0)
      alert("預設庫存不得小於1");
    else if (image.length == 0)
      alert("餐點圖片不能為空");
    else {
      const today = new Date().getDay();
      let inventory: Record<string, number> = {};
      for (let i = 1; i <= 7; i++){
        inventory[i.toString()] = count;
      }

      const newMeal: Meal = {
        Meal_ID: -1,
        Vendor_ID: Number(vendorId),
        Meal_Name: newMealName,
        Description: "",
        Price: newMealPrice,
        Inventory: inventory,
        Image_url: '',
        Default_Inventory: count
      };
      sendNewMealData(newMeal, image[0].file, setMeals);
    }
  }

  return (
    <div className={style.addMealItem_item}>
      <div className={style.addMealItem_attributeContainer}>
        <div className={style.addMealItem_mealContainer}>
          <div className={style.addMealItem_contentContainer}>
            <MealText placeholder={"餐點名稱"} inputType={"text"} setInput={setNewMealName}/>
            <MealText placeholder={"餐點價格"} inputType={"number"} setInput={setNewMealPrice}/>
          </div>

          <div className={style.addMealItem_otherContainer}>
            <div className={style.addMealItem_counterBox}>
              <div className={style.addMealItem_counter}>
                <Counter count={count} setCount={setCount} />
              </div>
              <div className={style.addMealItem_counterDescription}>預設庫存：</div>
            </div>
          </div>
        </div>

        <div className={style.addMealItem_buttonContainer}>
          <AddMealButton text="新增餐點" onClickFunc={() => {addMealOnClick()}}/>
        </div>
      </div>

      <ImageUploading
        multiple={false}
        value={image}
        onChange={uploadImageOnChange}
        onError={(errors, files) => {uploadImageOnError(errors, files)}}
        maxNumber={1}
        dataURLKey="data_url"
        maxFileSize={3000000}
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          <div className={style.addMealItem_imgBox} onClick={() => {
            onImageRemoveAll();
            onImageUpload();
          }}>
          {image.length > 0 ?  (
            <img src={image[0]['data_url']} alt="" className={style.addMealItem_img}/>
            ) : (<GrAdd/>)
          }
          </div>
        )}

      </ImageUploading>

    </div>
  );
}