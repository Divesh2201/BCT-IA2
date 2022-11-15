// TOOD: A Page where sellers can list their items
import { app, db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

const dbInstance = collection(db, 'products');
export default function Create() {
    const [name, setName] = useState('');
    const [price, setPrice] = useState();
    const [description, setDescription] = useState('');
    // const [image, setInput] = useState('');
    // const [day, setDay] = useState(0);
    const [month, setMonth] = useState(0);
    const [year, setYear] = useState(0);

    const performAdd = async (e) => {
        e.preventDefault()
        addDoc(dbInstance, {
            name: name,
            price: parseFloat(price),
            description: description,
            day: 0,
            month: parseInt(month),
            year: parseInt(year),
        })
        .then(() => {
            setName('');
            setPrice(0);
            setDescription('');
            setMonth(0);
            setYear(0);
        })
    }

    return (
        <div className='p-16 h-screen flex justify-center'>
            <form className="w-2/5">
                <div className="my-3">
                    <input className='w-full rounded-l p-2 border-2' id='name' type='text' placeholder='Product Name' value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="my-3">
                    <input className='w-full rounded-l p-2 border-2' id='price' type='number' placeholder='Product Price' value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div className="my-3">
                    <textarea className='w-full rounded-l p-2 border-2' id='description' placeholder='Product Description' value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <p className='my-2'>Warranty details - Expiry Duration</p>
                <div className="my-3">
                    <input className='w-2/5 border-2 rounded-l p-2 mr-3' id='year' type='number' placeholder='Year' value={year} onChange={e => setYear(e.target.value)} />
                    <input className='w-2/5 border-2 rounded-l p-2' id='month' type='number' placeholder='Month' value={month} onChange={e => setMonth(e.target.value)} />
                </div>
                <button className='my-3 bg-blue-600 hover:bg-blue-700 duration-300 text-white shadow p-2 rounded' type='submit' onClick={performAdd}>
                Add Product
                </button>
            </form>
        </div>
    )
}