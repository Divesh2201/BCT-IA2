// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTCollection is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address payable owner;

    constructor() {
        owner = payable(msg.sender);
    }

    struct DateTime {
        uint8 day;
        uint8 month;
        uint16 year;
    }

    struct Record {
        DateTime date;
        string description;
    }

    struct Warranty {
        uint256 tokenId;
        address nftContract;
        string itemId;
        address payable owner;
        bool valid;
        DateTime expiry;
    }

    mapping(uint256 => Warranty) private tokenIdToItem;
    mapping(uint256 => Record[]) private tokenIdToHistory;

    event WarrantyCreated(
        uint256 indexed tokenId,
        address indexed nftContract,
        string indexed itemId,
        address owner,
        bool valid,
        DateTime expiry
    );

    function getWarranty(uint256 tokenId) public view returns (Warranty memory) {
        return tokenIdToItem[tokenId];
    }

    function getHistoryForToken(uint256 tokenId) public view returns (Record[] memory) {
        return tokenIdToHistory[tokenId];
    }

    function createWarranty(address nftContract, string memory itemId, uint8 day, uint8 month, uint16 year) public payable nonReentrant {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        DateTime memory expiry = DateTime(day, month, year);

        tokenIdToItem[tokenId] = Warranty(
            tokenId,
            nftContract,
            itemId,
            payable(msg.sender),
            true,
            expiry
        );

        // IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit WarrantyCreated(
            tokenId,
            nftContract,
            itemId,
            msg.sender,
            true,
            expiry
        );
    }

    function destroyWarranty(uint256 tokenId) public {
        require(tokenIdToItem[tokenId].owner == msg.sender, "You cannot destroy this token");
        tokenIdToItem[tokenId].valid = false;
    }

    function transferWarranty(address nftContract, uint256 tokenId) public payable nonReentrant {
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        tokenIdToItem[tokenId].owner = payable(msg.sender);
    }

    function addHistory(uint256 id, uint8 day, uint8 month, uint16 year, string memory description, bool is_still_valid) public returns (bool) {
        DateTime memory d = DateTime(day, month, year);
        DateTime memory expiry = tokenIdToItem[id].expiry;

        if (d.year > expiry.year || d.year == expiry.year && d.month > expiry.month || d.year == expiry.year && d.month == expiry.month && d.day > expiry.day) {
            tokenIdToItem[id].valid = false;
        }
        
        if (tokenIdToItem[id].valid) {
            if (is_still_valid == false) {
                tokenIdToItem[id].valid = false;
            }
            
            tokenIdToHistory[id].push(Record(d, description));
            return true;
        } else {
            return false;
        }
    }

    function fetchAllNFTs() public view returns (Warranty[] memory) {
        uint256 tokenCount = _tokenIds.current();
        uint index = 0;
        uint count = 0;

        for (uint256 i = 0; i < tokenCount; i++) {
            if (tokenIdToItem[i + 1].valid == true) {
                count += 1;
            }
        }

        Warranty[] memory tokens = new Warranty[](count);
        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 currentId = i + 1;
            if (tokenIdToItem[currentId].valid == true) {
                Warranty storage token = tokenIdToItem[currentId];
                tokens[index] = token;
                index += 1;
            }
        }

        return tokens;
    }

    function fetchMyNFTs() public view returns (Warranty[] memory) {
        uint256 tokenCount = _tokenIds.current();
        uint256 ownedByMe = 0;
        uint256 index = 0;

        for (uint256 i = 0; i < tokenCount; i++) {
            if (tokenIdToItem[i + 1].valid && tokenIdToItem[i + 1].owner == msg.sender) {
                ownedByMe += 1;
            }
        }

        Warranty[] memory tokens = new Warranty[](ownedByMe);
        for (uint256 i = 0; i < tokenCount; i++) {
            if (tokenIdToItem[i + 1].valid && tokenIdToItem[i + 1].owner == msg.sender) {
                uint256 tokenId = tokenIdToItem[i + 1].tokenId;
                Warranty storage token = tokenIdToItem[tokenId];
                tokens[index] = token;
                index += 1;
            }
        }

        return tokens;
    }
    
}
