/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Web3Modal from "web3modal";
import { nftAddress, nftCollectionAddress } from '../config';
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Collection from "../artifacts/contracts/NFTCollection.sol/NFTCollection.json";
import { create as ipfsHttpClient } from 'ipfs-http-client';


// list all items of ecommerce items
const dbInstance = collection(db, 'products');
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');
export default function Home() {

	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadItems();
	}, [])

	async function loadItems() {
		getDocs(dbInstance)
            .then((data) => {
                setItems(data.docs.map((item) => {
                    return { ...item.data(), id: item.id }
                }));
			})
		setLoading(false);
	}

	async function purchaseItem(item) {
		// TODO: usual ecommerce transaction

		// Warranty Issuance
		console.log(item);
		await createWarranty(item);
		loadItems();
	}

	async function createWarranty(item) {
		const data = JSON.stringify(
			{
				"name": item.name,
				"description": item.description,
			}
		)

		try {
			const added = await client.add(data);
			const url = `https://ipfs.infura.io/ipfs/${added.path}`
			const duration = {
				day: item.day,
				month: item.month,
				year: item.year,
			}
			ownWarranty(item.id, duration, url);
		} catch (error) {
			console.log("Error Updating Files: ", error);
		}
	}

	async function ownWarranty(itemId, duration, url) {
		const today = new Date();
		const expiry = new Date(today.getFullYear() + duration.year, today.getMonth() + duration.month, today.getDay() + duration.day);
		const date = expiry.getDate();
		const month = expiry.getMonth();
		const year = expiry.getFullYear();

		try {
			const web3Modal = new Web3Modal()
			const connection = await web3Modal.connect()
			const provider = new ethers.providers.Web3Provider(connection)
			const signer = provider.getSigner()

			const nftContract = new ethers.Contract(nftAddress, NFT.abi, signer);
			const collectionContract = new ethers.Contract(nftCollectionAddress, Collection.abi, signer);

			const token = await nftContract.createToken(url);
			await token.wait()
			
			const transaction = await collectionContract.createWarranty(nftAddress, itemId, date, month, year);
			await transaction.wait();

		} catch (error) {
			console.log(error);
		}

		// TODO: Add corresponding tokenID to ecommerce database as alloted to customer
	}
	
	if (loading === true) {
        return <h1 className="py-10 px-20 text-3xl">Loading...</h1>
	} else if (!items.length) {
        return (
            <h1 className="py-10 px-20 text-3xl">No Items Available</h1>
        )
    }
	return (
		<div className="flex justify-center">
			<div className="px-4 my-8">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
				{
					items.map((item, i) => (
					<div key={i} className="border shadow rounded-xl overflow-hidden bg-gray-100">
						{/* <img src={item.imageURL} /> */}
						<div className="p-4">
							<p style={{ height: '64px' }} className="text-2xl font-semibold">{item.name}</p>
							<div style={{ height: '70px', overflow: 'hidden' }}>
								<p className="text-gray-600">{item.description}</p>
							</div>
						</div>
						<div className="p-4 bg-blue-700">
							<p className="text-2xl font-bold text-white">&#8377; {item.price}</p>
							<button className="mt-4 w-full bg-yellow-300 text-black font-bold py-2 px-12 rounded" onClick={() => purchaseItem(item)}>Buy</button>
						</div>
					</div>
					))
				}
				</div>
			</div>
		</div>
	)
}
