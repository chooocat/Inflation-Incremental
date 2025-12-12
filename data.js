function E(x) {return new Decimal(x)}

function getRawData() {
    return {
        didHardReset: false,

        points: {
            amount: E(1),
            best: E(1),
            level: E(0),
            levelXp: E(0),
        },
        prestige: {
            points: E(0),
            best: E(0),
            total: E(0),
            level: E(0),
            levelXp: E(0),
            prestiged: false,
        },

        unlocks: {
            prestige: false,
        },

        //doCost types:
        //0 - none
        //1 - normal (subtract)
        //2 - reset (with resetTo option)
        upgrades: {
            points: {
                1: {
                    level: E(0),
                    levelCap: E('10^^100'),
                    baseCost: E(1e4),
                    cost: E(1e4),
                    doCost: 2,
                    currency: 0,
                    resetTo: 1,
                },
                2: {
                    level: E(0),
                    levelCap: E('30'),
                    baseCost: E(3e6),
                    cost: E(3e6),
                    doCost: 2,
                    currency: 0,
                    resetTo: 1,
                },
                3: {
                    level: E(0),
                    levelCap: E('10^^100'),
                    baseCost: E('1e100'),
                    cost: E('1e100'),
                    doCost: 2,
                    currency: 0,
                    resetTo: 1,
                },
            },
            prestige: {
                1: {
                    level: E(0),
                    levelCap: E('10^^100'),
                    baseCost: E(3),
                    cost: E(3),
                    doCost: 1,
                    currency: 1,
                    resetTo: 1,
                },
                2: {
                    level: E(0),
                    levelCap: E('10^^100'),
                    baseCost: E(5e3),
                    cost: E(5e3),
                    doCost: 1,
                    currency: 1,
                    resetTo: 1,
                },
            },
        },

        options: {
            confirms: {
                prestige: true,
            }
        },
    };
}

var player = getRawData();

var nonSavePlayer = {
    softcapLevel: 0,
    prestigePointGain: E(0),
    pointXpReq: E(0),
    pointXpCur: E(0),
    prestigeXpReq: E(0),
    prestigeXpCur: E(0),
}

var upgradeFormulas = {
    points: {
        1: {
            costForm: function(remLevel = E(0)) {
                let upgrade = player.upgrades.points['1']
                if (upgrade.level.gte(70)) {
                    return upgrade.baseCost.mul(E(40).pow(upgrade.level.sub(remLevel)))
                }
                return upgrade.baseCost.mul(E(25).pow(upgrade.level.sub(remLevel)))
            },
            levelForm: function() {
                let upgrade = player.upgrades.points['1']
                if (upgrade.level.gte(70)) {
                    return player.points.amount.div(upgrade.baseCost).log(40).add(1).floor()
                }
                return player.points.amount.div(upgrade.baseCost).log(25).add(1).floor()
            }
        },
        2: {
            costForm: function(remLevel = E(0)) {let upgrade = player.upgrades.points['2']; return upgrade.baseCost.mul(E(200).pow(upgrade.level.sub(remLevel)))},
            levelForm: function() {let upgrade = player.upgrades.points['2']; return player.points.amount.div(upgrade.baseCost).log(200).add(1).floor()}
        },
        3: {
            costForm: function(remLevel = E(0)) {let upgrade = player.upgrades.points['3']; return upgrade.baseCost.mul(E('1e10').pow(upgrade.level.sub(remLevel)))},
            levelForm: function() {let upgrade = player.upgrades.points['3']; return player.points.amount.div(upgrade.baseCost).log('1e10').add(1).floor()}
        },
    },
    prestige: {
        1: {
            costForm: function(remLevel = E(0)) {let upgrade = player.upgrades.prestige['1']; return upgrade.baseCost.mul(E(2).pow(upgrade.level.sub(remLevel)))},
            levelForm: function() {let upgrade = player.upgrades.prestige['1']; return player.prestige.points.div(upgrade.baseCost).log(2).add(1).floor()}
        },
        2: {
            costForm: function(remLevel = E(0)) {let upgrade = player.upgrades.prestige['2']; return upgrade.baseCost.mul(E(3).pow(upgrade.level.sub(remLevel)))},
            levelForm: function() {let upgrade = player.upgrades.prestige['2']; return player.prestige.points.div(upgrade.baseCost).log(3).add(1).floor()}
        },
    },
}

var currencyStringValues = [
    "points.amount",
    "prestige.points",
]

var multi = {
    points: {
        add_base: E(2),
        mul_upg_p1: E(1),
        mul_upg_pr1: E(1),
        mul_prestigeBonus: E(1),
        mul_pointLevelBonus: E(1),
        div_softcap1: E(1),
        div_softcap2: E(1),
        div_softcap3: E(1),
        div_softcap4: E(1),

        xp: {
            add_base: E(0),
            mul_prestigeLevelBonus: E(1),
            mul_upg_p3: E(1),
            mul_upg_pr2: E(1),
        },

        softcap_start: {
            1: {
                add_base: E(100),
                mul_upg_p2: E(1),
                mul_pointLevelBonus: E(1),
            },
            2: {
                add_base: E('1e40'),
                mul_pointLevelBonus: E(1),
            },
        },
    },
    prestige: {
        add_base: E(1),
        mul_prestigeLevelBonus: E(1),

        xp: {
            add_base: E(0)
        },
    },

    other: {}
}

//for saving and loading i used the TMT code cuz i cant

function save() {
    const saveData = encodeURIComponent(JSON.stringify(player))
    localStorage.setItem("game-data_player", btoa(saveData))
}

function fixSave() {
	defaultData = getRawData();
	fixData(defaultData, player);
}

function fixData(defaultData, newData) {
	for (item in defaultData) {
		if (defaultData[item] == null) {
			if (newData[item] === undefined)
				newData[item] = null;
		}
		else if (Array.isArray(defaultData[item])) {
			if (newData[item] === undefined)
				newData[item] = defaultData[item];

			else
				fixData(defaultData[item], newData[item]);
		}
		else if (defaultData[item] instanceof Decimal) { // Convert to Decimal
			if (newData[item] === undefined)
				newData[item] = defaultData[item];

			else
				newData[item] = new Decimal(newData[item]);
		}
		else if ((!!defaultData[item]) && (typeof defaultData[item] === "object")) {
			if (newData[item] === undefined || (typeof defaultData[item] !== "object"))
				newData[item] = defaultData[item];

			else
				fixData(defaultData[item], newData[item]);
		}
		else {
			if (newData[item] === undefined)
				newData[item] = defaultData[item];
		}
	}
}

function load() {
    const data = JSON.parse(decodeURIComponent(atob(localStorage.getItem("game-data_player"))))
    
    if (!data) {
        player = getRawData()
        return;
    }

    player = Object.assign(getRawData(), data)
    fixSave()
    document.getElementById("pre-load-hardReset").style.display = "none"

    if (player.didHardReset) {
        hardReset2() //for true reseting
    }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Text copied to clipboard');
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}


function exportData() {
    copyToClipboard(btoa(encodeURIComponent(JSON.stringify(player))))
    alert("Copied data to clipboard")
}

function importData() {
	let imported = prompt("Paste your save here");
	try {
		tempPlr = Object.assign(getRawData(), JSON.parse(decodeURIComponent(atob(imported))));
		player = tempPlr;
		fixSave();
		save();
		window.location.reload();
	} catch (e) {
		return;
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
    player = getRawData();
    player.didHardReset = true
    save();
    location.reload();
}

function hardReset2() {
    player = getRawData();
    save();
    location.reload();
}

function hROption() {
    let conf = prompt("Are you sure you want to fully wipe off all your data? This action cannot be undone\n Type: 'yes yes i want to reset' to confirm.")

    if (conf.toLowerCase() === "yes yes i want to reset") {
        let conf2 = confirm("This is last warning. Click OK if you are sure")
        if (conf2) hardReset()
    }
}