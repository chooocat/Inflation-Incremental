function E(x) {return new Decimal(x)}

var player = {
    points: E(1),
    softcapLevel: 0,
}

//doCost types:
//0 - none, meaning the currency will get unaffected
//1 - subtraction (currency -= cost)
//2 - reseting (req. to fill "resetTo" property)
var upgrades = {
    points: {
        1: {
            level: E(0),
            levelCap: E('10^^100'),
            baseCost: E(1e4),
            cost: E(1e4),
            doCost: 2,
            resetTo: E(1), //only for doCost 2's
        },
        2: {
            level: E(0),
            levelCap: E('30'),
            baseCost: E(3e6),
            cost: E(3e6),
            doCost: 2,
            resetTo: E(1), //only for doCost 2's
        },
    }
}

var upgradeFormulas = {
    points: {
        1: {
            costForm: function(remLevel = E(0)) {let upgrade = upgrades.points['1']; return upgrade.baseCost.mul(E(25).pow(upgrade.level.sub(remLevel)))},
            levelForm: function() {let upgrade = upgrades.points['1']; return player.points.div(upgrade.baseCost).log(25).add(1).floor()}
        },
        2: {
            costForm: function(remLevel = E(0)) {let upgrade = upgrades.points['2']; return upgrade.baseCost.mul(E(200).pow(upgrade.level.sub(remLevel)))},
            levelForm: function() {let upgrade = upgrades.points['2']; return player.points.div(upgrade.baseCost).log(200).add(1).floor()}
        },
    }
}

var multi = {
    points: {
        add_base: E(2),
        mul_upg_p1: E(1),
        div_softcap1: E(1),
        div_softcap2: E(1),
        root_softcap3: E(1),

        softcap_start: {
            1: {
                add_base: E(100),
                mul_upg_p2: E(1),
            }
        },
    }
}

var clearPlayer = player
var clearUpgrades = upgrades

function convertObjectValuesToEtern(obj) {
    const newObj = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (typeof value === 'string') {
                newObj[key] = E(value); // Convert to break_eternity
            } else if (typeof value === 'object') {
                newObj[key] = convertObjectValuesToEtern(value)
            } else {
                newObj[key] = value; // Keep other types as they are
            }
        }
    }
    return newObj;
}

function save() {
    localStorage.setItem("game-data_player", JSON.stringify(player))
    localStorage.setItem("game-data_upgrades", JSON.stringify(upgrades))
}

function load() {
    const data_player = JSON.parse(localStorage.getItem("game-data_player"))
    const data_upgrades = JSON.parse(localStorage.getItem("game-data_upgrades"))

    if (data_player) {
        player = convertObjectValuesToEtern(data_player)
    }

    if (data_upgrades) {
        upgrades = convertObjectValuesToEtern(data_upgrades)
    }
}

function getBase(path, keyword) {
    let base = E(1)
    
    if (keyword === "add") base = E(0)

    for (const key in path) {
        if (key.startsWith(keyword)) {
            const val = path[key]
            if (keyword === "add") {base = base.add(val); continue}
            base = base.mul(val)
        }
    }

    return base
}

function getMulti(path) {
    let effect = getBase(path, "add")
    effect = effect.mul(getBase(path, "mul"))
    effect = effect.pow(getBase(path, "pow"))
    effect = effect.div(getBase(path, "div"))
    effect = effect.root(getBase(path, "root"))
    
    return effect
}

function hardReset() {
    player = clearPlayer
    upgrades = clearUpgrades
    save()
    location.reload()
}