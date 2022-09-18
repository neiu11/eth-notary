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
    instance.ownerOf.call(starId)
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

    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 6;

    await instance.createStar('teststar999', starId, {from: user1});
    let contract_name = await instance.name(); 
    let contract_symbol = await instance.symbol();
    let star_lookup = await instance.lookUptokenIdToStarInfo(starId);

    assert.equal(contract_name,'StarNova');
    assert.equal(contract_symbol,'NOVA');
    assert.equal(star_lookup,'teststar999');
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed

    let tokenId = 7;
    let tokenId2 = 8;
    let user1 = accounts[0];
    let user2 = accounts[1];

    let instance = await StarNotary.deployed(); 
    await instance.createStar('awesome star', tokenId, {from: user1});
    await instance.createStar('awesome star2', tokenId2, {from: user2});
    await instance.exchangeStars.call(tokenId, tokenId2);
    
    let new_owner_token1 = await instance.ownerOf.call(tokenId)
    let new_owner_token2 = await instance.ownerOf.call(tokenId2)

    assert.equal(new_owner_token1, user2);
    assert.equal(new_owner_token2, user1);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
    let tokenId = 10;
    let user1 = accounts[1];
    let user2 = accounts[2];

    let instance = await StarNotary.deployed(); 
    await instance.createStar('awesome star3', tokenId, {from: user1});
    await instance.transferStar(user2, tokenId, {from: user1});

    let new_owner = await instance.ownerOf.call(tokenId)
    assert.equal(new_owner, user2)
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    let tokenId = 11;
    let star_name = "Tested star name"
    let instance = await StarNotary.deployed(); 
    await instance.createStar(star_name, tokenId);
    let created_name = await instance.lookUptokenIdToStarInfo.call(tokenId)
    console.log("CREATED NAME", created_name)
    assert.equal(star_name, created_name)
});