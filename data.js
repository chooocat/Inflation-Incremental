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
            levelCap: "none",
            baseCost: E(1e4),
            cost: E(1e4),
            currency: "points",
            doCost: 2,
            resetTo: E(1), //only for doCost 2's

            costForm: function(remLevel = E(0)) {return this.baseCost.mul(E(25).pow(this.level.sub(remLevel)))},
            levelForm: function() {return player.points.div(this.baseCost).log(25).add(1).floor()}
        },
        2: {
            level: E(0),
            levelCap: "none",
            baseCost: E(3e6),
            cost: E(3e6),
            currency: "points",
            doCost: 2,
            resetTo: E(1), //only for doCost 2's

            costForm: function(remLevel = E(0)) {return this.baseCost.mul(E(200).pow(this.level.sub(remLevel)))},
            levelForm: function() {return player.points.div(this.baseCost).log(200).add(1).floor()}
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