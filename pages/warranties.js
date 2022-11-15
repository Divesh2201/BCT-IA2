import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import Web3Modal from 'web3modal'
import { nftAddress, nftCollectionAddress } from '../config'
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Collection from "../artifacts/contracts/NFTCollection.sol/NFTCollection.json";
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function Warranties() {
    const [nfts, setNfts] = useState([]);
    const [loadingState, setLoadingState] = useState(true);

    useEffect(() => {
        loadNFTs();
    }, [])

    async function loadNFTs() {
        try {
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();

            const nftContract = new ethers.Contract(nftAddress, NFT.abi, signer);
            const collectionContract = new ethers.Contract(nftCollectionAddress, Collection.abi, signer);
            const data = await collectionContract.fetchMyNFTs();

            const items = await Promise.all(data.map(async item => {
                const tokenURI = await nftContract.tokenURI(item.tokenId);
                const docRef = doc(db, "products", `${item.itemId}`);
                const docSnap = await getDoc(docRef);
                const product = docSnap.data();
                const expiryDate = item.expiry;

                let warranty = {
                    tokenId: item.tokenId.toNumber(),
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    expiry: new Date(expiryDate.year, expiryDate.month, expiryDate.day),
                    url: tokenURI
                }
                return warranty;
            }))

            setNfts(items);
            setLoadingState(false);
        } catch (error) {
            console.log(error);
        }
        
    }

    if (loadingState === true) {
        return <h1 className="py-10 px-20 text-3xl">Loading...</h1>
    }
    
    if (loadingState === false && !nfts.length) {
        return (
            <h1 className="py-10 px-20 text-3xl">No Warranties owned</h1>
        )
    }

    return (
        <div className="flex justify-center">
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {
                    nfts.map((item, i) => (
                        <div key={i} className="border shadow rounded-xl">
                            <div className="p-4">
                                <div key={i} className="border shadow rounded-xl overflow-hidden">
                                    {/* <img src={item.imageURL} /> */}
                                    <div className="p-4">
                                        <p className="text-2xl font-semibold">{item.name}</p>
                                        <div style={{ height: '30px', overflow: 'hidden' }}>
                                            <p className="text-gray-400">{item.description}</p>
                                        </div>
                                    </div>
                                    <a href={item.url} target="_blank" rel="noreferrer" className="px-4 text-sm font-bold text-blue-700">View Warranty</a>
                                    <p className="text-sm pt-2 px-4">Maximum Validity:</p>
                                    <p className="px-4 pb-3 text-xl font-bold text-gray-700">{item.expiry.toDateString()}</p>
                                </div>
                            </div>
                        </div>
                    ))
                }
                </div>
            </div>
        </div>
    )
}