
function validInput() {
    'use strict'
    var correct = false;
    if ($('#fPrice')[0].value > 0 && $('#fMarketing')[0].value > 0 && $('#fDepresation')[0].value > 0 && $('#fQuality')[0].value > 0) {
        // valid input depresation
        //

        return true;
    }
    return correct;
}

function startCalcResult() {
    'use strict'
    // alert('e');
    var priceSum = 0;
    var marketingSum = 0;
    var qualitySum = 0;
    for (var a = 0; a < playerList.length; a++) {
        marketingSum = marketingSum + +playerList[a].marketing;
        playerList[a].salesPerPeriod = 0;
        playerList[a].pointsPerPeriod = 0;
    }
    for (var b = 0; b < playerList.length; b++) {
        qualitySum = qualitySum + +playerList[b].quality;

        //////////////////////////////////////
    }


    for (var i = 0; i < playerList.length; i++) {
        // calc sales for each player
        if (playerList[i].price < gameParameter.zeroSales && playerList[i].price > 0) {
            var pricePoint = calcPricePoint(playerList[i])[0];
            priceSum = priceSum + pricePoint;
            playerList[i].pointsPerPeriod = playerList[i].pointsPerPeriod + pricePoint;
            playerList[i].maxSales = calcPricePoint(playerList[i])[1];
            // console.log(pricePoint);
            console.log(playerList[i].maxSales);
        }
    }
    for (var i = 0; i < playerList.length; i++) {
        if (playerList[i].pointsPerPeriod == 0) {
            continue;
        }

        var marketingPoint = calcMarketingPoint(playerList[i], marketingSum, priceSum);

        playerList[i].pointsPerPeriod = playerList[i].pointsPerPeriod + marketingPoint;
    }
    for (var i = 0; i < playerList.length; i++) {
        if (playerList[i].pointsPerPeriod == 0) {
            continue;
        }
        var qualityPoint = calcQualityPoint(playerList[i], qualitySum, priceSum);
        playerList[i].pointsPerPeriod = playerList[i].pointsPerPeriod + qualityPoint;
    }



    function salesTime() {
        gameParameter.dayNow++;
        var calcAllPoint = 0;
        for (var i = 0; i < playerList.length; i++) {
            calcAllPoint = calcAllPoint + playerList[i].pointsPerPeriod;
        }

        // product per player 
        for (var i = 0; i < playerList.length; i++) {
            var percentOfIndustry = +(playerList[i].pointsPerPeriod / calcAllPoint).toFixed(3);
           
            playerList[i].salesPerPeriod = Math.round(gameParameter.industrySupply * percentOfIndustry);
            // console.log(gameParameter.industrySupply);
            if (playerList[i].salesPerPeriod > playerList[i].maxSales) {
                playerList[i].salesPerPeriod = playerList[i].maxSales;
            }
            // console.log(playerList[i].industryPower + playerList[i].buferProduct);
            if (playerList[i].salesPerPeriod > (playerList[i].industryPower + playerList[i].buferProduct)) {
                playerList[i].salesPerPeriod = (playerList[i].industryPower + playerList[i].buferProduct);
            }
            
            playerList[i].orderReceived = Math.round(playerList[i].salesPerPeriod);
            // console.log(playerList[i].orderReceived);

        }
    }
    salesTime();


    function industryChanges() {
        gameParameter.industrySupply = Math.round(gameParameter.industrySupply * (1 + (gameParameter.industryChanges / 100)));
    }
    industryChanges();


    function calcBuffer() {
        for (var i = 0; i < playerList.length; i++) {
            playerList[i].buferProduct = +playerList[i].buferProduct + (+playerList[i].industryPower - +playerList[i].salesPerPeriod);

        }
    }
    calcBuffer();

    function calcInvesting() {
        for (var i = 0; i < playerList.length; i++) {

            var tempDepresation = playerList[i].deprecation;
            var deprecationNeed = playerList[i].industryPower * 2;

            var deltaDepresation = tempDepresation - deprecationNeed;
            var destoyedIndustry = Math.floor(deltaDepresation / 40);

            playerList[i].industryPower = playerList[i].industryPower + destoyedIndustry;

        }
    }
    calcInvesting();

    function calcIncome() {
        for (var i = 0; i < playerList.length; i++) {
            var tempSales = +playerList[i].salesPerPeriod * playerList[i].price;
            playerList[i].sales = tempSales;
            var tempWaste = +playerList[i].industryPower * playerList[i].pricePerProduct;
            playerList[i].cogs = tempWaste;
            var tempBufferCost = +playerList[i].buferProduct * 2;
            var tempWasteMarketingAndOther = +(+playerList[i].marketing) + (+playerList[i].quality);
            var tempWasteForDepresation = (+playerList[i].deprecation);
            var allWaste = +tempWaste + tempBufferCost + +tempWasteMarketingAndOther + +tempWasteForDepresation;
            playerList[i].TCUS = Math.round((+tempWaste + +tempWasteMarketingAndOther) / playerList[i].salesPerPeriod * 100) / 100;

            playerList[i].MUS = playerList[i].price - playerList[i].TCUS;

            var profitBeforeTax = +tempSales - +allWaste;
            // console.log(profitBeforeTax);
            playerList[i].profitBeforeTax = profitBeforeTax;
            if (playerList[i].profitBeforeTax > 0) {
                playerList[i].tax = profitBeforeTax * gameParameter.tax / 100;
                var netProfit = profitBeforeTax * (100 - gameParameter.tax) / 100;
            } else {
                playerList[i].tax = 0;
                netProfit = profitBeforeTax;
            }

            // console.log(netProfit);
            playerList[i].income = netProfit;
        }

    }
    calcIncome();

    function calcBalance() {
        for (var i = 0; i < playerList.length; i++) {
            playerList[i].balance = playerList[i].balance + playerList[i].income;
            if (playerList[i].balance < 0) {
                var tempCredit = playerList[i].balance * (-1);
                tempCredit = tempCredit * (1 + (gameParameter.bankPercent / 100));
                playerList[i].credit = tempCredit;
                playerList[i].balance = playerList[i].balance * (1 + (gameParameter.bankPercent / 100));
            } else {
                playerList[i].credit = 0;
            }

            if (playerList[i].balance < (-1) * gameParameter.creditLine && gameParameter.dayNow > 0 && playerList[i].lose == false) {
                playerList[i].lose = 1;
                playerList[i].name = playerList[i].name + ' lose';
            }
            playerList[i].capitalInvestment = playerList[i].industryPower * 40;
            playerList[i].totalAssets = playerList[i].capitalInvestment + playerList[i].balance;
        }
    }

    calcBalance();

    function calcIndustry() {
        //sum price
        var priceSum = 0;
        for (var i = 0; i < playerList.length; i++) {
            priceSum = priceSum + +playerList[i].price;
            // console.log(priceSum);
        }
        gameParameter.avgPrice = +priceSum / playerList.length;
        var marketingSum = 0;
        for (var i = 0; i < playerList.length; i++) {
            marketingSum = marketingSum + +playerList[i].marketing;
            // console.log(marketingSum);
        }
        gameParameter.totalMarketing = marketingSum;
        var qualitySum = 0;
        for (var i = 0; i < playerList.length; i++) {
            qualitySum = qualitySum + +playerList[i].quality;
        }
        gameParameter.TQI = qualitySum;
    }

    calcIndustry();

}


// var tempQuatity = 0;

// done
function calcPricePoint(playerStat) {
    'use strict'
    // tempQuatity = 0;
    var price = playerStat.price;
    var supply = gameParameter.industrySupply;
    var pGrid = {
        poor: gameParameter.poorPeople,
        medium: gameParameter.mediumPeople,
        rich: gameParameter.richPeople,
        poorS: gameParameter.poorSens,
        mediumS: gameParameter.mediumSens,
        richS: gameParameter.richSens,
    };
    var yourQInPercent = 0;
    var visiblePrice = gameParameter.zeroSales - gameParameter.fullSales;
    var sensSum = pGrid.poorS + pGrid.mediumS + pGrid.richS;
    var deltaPricePerSens = Math.round(visiblePrice / sensSum);
    var mediumCross = Math.round(gameParameter.fullSales + (visiblePrice / sensSum * pGrid.poorS));
    var richCross = Math.round(mediumCross + (visiblePrice / sensSum * pGrid.poorS));
    var totalQ = 0;
    if (price <= mediumCross) {
        let maxQ = pGrid.poor;
        let visiblePriceNow = deltaPricePerSens * pGrid.poorS;
        let deltaFromEtalon = price - gameParameter.fullSales;
        let partOfPriceNow = deltaFromEtalon / visiblePriceNow;
        totalQ = pGrid.medium + pGrid.rich + Math.round(maxQ * (1 - partOfPriceNow));
    } else if (price <= richCross) {
        // debugger;
        let maxQ = pGrid.medium;
        let visiblePriceNow = deltaPricePerSens * pGrid.mediumS;
        let deltaFromEtalon = price - mediumCross;
        let partOfPriceNow = deltaFromEtalon / visiblePriceNow;
        totalQ = pGrid.rich + Math.round(maxQ * (1 - partOfPriceNow));
    } else if (price > richCross) {
        let maxQ = pGrid.rich;
        let visiblePriceNow = deltaPricePerSens * pGrid.richS;
        let deltaFromEtalon = price - richCross;
        let partOfPriceNow = deltaFromEtalon / visiblePriceNow;
        totalQ = Math.round(maxQ * (1 - partOfPriceNow));
    }
    // console.log(totalQ);
    var qMultiplier = totalQ / 100;
    var maxSales = supply * qMultiplier;
    return [Math.round(maxSales * gameParameter.priceSens), maxSales];
}

function calcMarketingPoint(playerStat, Msum, Psum) {
    'use strict'
    var marketing = playerStat.marketing;
    var percentOfIndustry = marketing / Msum;
    Psum = Psum * (100 / gameParameter.priceSens);
    var allPointsOfMarkiting = Psum * gameParameter.marketingSens / 100;
    // console.log(allPointsOfMarkiting);
    var marketingPoint = allPointsOfMarkiting * percentOfIndustry;
    return Math.round(marketingPoint);
}

function calcQualityPoint(playerStat, Msum, Psum) {
    'use strict'
    var quality = playerStat.quality;
    var percentOfIndustry = quality / Msum;
    Psum = Psum * (100 / gameParameter.priceSens);

    var allPointsOfMarkiting = Psum * gameParameter.qualitySens / 100;
    // console.log(allPointsOfMarkiting);
    var qualityPoint = allPointsOfMarkiting * percentOfIndustry;

    return Math.round(qualityPoint);
}
