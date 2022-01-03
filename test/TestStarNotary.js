const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    const instance = await StarNotary.deployed();
    // Create a Star with different tokenId
    const star = {
        owner: accounts[4],
        name: 'Alpha Centauri',
        id: 2021
    }
    await instance.createStar(star.name, star.id, { from: star.owner });
    const starName = await instance.lookUptokenIdToStarInfo(star.id);
    // Checking
    assert.equal(starName, star.name);
    // Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    const nameTest = "David Gaspar Token";
    const symbolTest = "DGT";
    await instance.setInfo(nameTest, symbolTest);
    let name = await instance.name.call();
    let symbol = await instance.symbol.call();
    // Checking
    assert.equal(name, nameTest);
    assert.equal(symbol, symbolTest);
});

it('lets 2 users exchange stars', async() => {
    const instance = await StarNotary.deployed();
    // Create 2 Stars with different tokenId
    const star1 = {
        owner: accounts[2],
        name: "Betelgeuse",
        id: 1831,
    }
    const star2 = {
        owner: accounts[8],
        name: "Rigel",
        id: 1988,
    }
    await instance.createStar(star1.name, star1.id, { from: star1.owner });
    await instance.createStar(star2.name, star2.id, { from: star2.owner });
    // Call the exchangeStars functions implemented in the Smart Contract
    await instance.approve(star2.owner, star1.id, { from: star1.owner });
    await instance.approve(star1.owner, star2.id, { from: star2.owner });
    await instance.exchangeStars(star1.id, star2.id, { from: star1.owner });
    // Verify that the owners changed
    const ownerOfStar1 = await instance.ownerOf.call(star1.id);
    const ownerOfStar2 = await instance.ownerOf.call(star2.id);
    assert.equal(ownerOfStar1, star2.owner);
    assert.equal(ownerOfStar2, star1.owner);
});

it('lets a user transfer a star', async() => {
    const instance = await StarNotary.deployed();
    // Create a Star with different tokenId
    const star = {
        owner: accounts[3],
        name: "Pleiades",
        id: 444
    }
    await instance.createStar(star.name, star.id, { from: star.owner });
    let starOwner = await instance.ownerOf.call(star.id);
    assert.equal(star.owner, starOwner);
    // Use the transferStar function implemented in the Smart Contract
    const ownerFinal = accounts[6];
    await instance.transferStar(ownerFinal, star.id, { from: star.owner });
    // Verify the star owner changed.
    starOwner = await instance.ownerOf.call(star.id);
    assert.equal(ownerFinal, starOwner);
});

it('lookUptokenIdToStarInfo test', async() => {
    const instance = await StarNotary.deployed();
    // Create a Star with different tokenId
    const star = {
        owner: accounts[9],
        name: 'Sun',
        id: 1999
    }
    await instance.createStar(star.name, star.id, { from: star.owner });
    // Call your method lookUptokenIdToStarInfo
    const starName = await instance.lookUptokenIdToStarInfo(star.id);
    // Verify if you Star name is the same
    assert.equal(star.name, starName);
});