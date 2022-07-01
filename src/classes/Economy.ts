import { Leaderboard, Options } from "../Constants";

// Managers
import { BalanceManager } from "./BalanceManager";
import { RewardsManager } from "./RewardsManager";
import { HistoryManager } from "./HistoryManager";
import { ItemsManager } from "./ItemsManager";
import { BankManager } from "./BankManager";
import { ShopManager } from "./ShopManager";
import { DBManager } from "./DBManager";

export interface Economy {
  options: Options;
  database: DBManager;
  version: string;

  balance: BalanceManager;
  bank: BankManager;
  shop: ShopManager;
  items: ItemsManager;
  rewards: RewardsManager;
  history: HistoryManager;
}

/**
 * Class that controls Economy System
 *
 * @class
 * @classdesc Economy Class
 */
export class Economy {
  /**
   * @constructor
   *
   * @param {Options} options Module Options
   */
  constructor(options: Options) {
    /**
     * Module Options
     *
     * @type {Options}
     */
    this.options = options;
    if (!this.options.DBName) this.options.DBName = "economy";

    /**
     * Module Database
     *
     * @type {DBManager}
     */
    this.database = new DBManager(this.options);

    /**
     * Module Version
     *
     * @type {string}
     */
    this.version = "1.2.3";

    /**
     * Balance Manager
     *
     * @type {BalanceManager}
     */
    this.balance = new BalanceManager(this.options);

    /**
     * Bank Manager
     *
     * @type {BankManager}
     */
    this.bank = new BankManager(this.options);

    /**
     * Shop Manager
     *
     * @type {ShopManager}
     */
    this.shop = new ShopManager(this.options);

    /**
     * Inventory Manager
     *
     * @type {ItemsManager}
     */
    this.items = new ItemsManager(this.options);

    /**
     * Rewards Manager
     *
     * @type {RewardsManager}
     */
    this.rewards = new RewardsManager(this.options);

    /**
     * History Manager
     *
     * @type {HistoryManager}
     */
    this.history = new HistoryManager(this.options);

    this.init();
  }

  /**
   * Method that Returns Guild Balance Leaderboard by Balance.
   *
   * @param {string} guildID Guild ID
   *
   * @returns {Promise<null|Leaderboard[]>}
   */
  leaderboard(guildID: string): Promise<null | Leaderboard[]> {
    return new Promise(async (res, rej) => {
      var data = await this.database.get(guildID);

      if (!data) data = await this.database.createGuild(guildID);
      if (!data.users.length) return res(null);

      var sortedTop = data.users.sort((a, b) => b.balance - a.balance);
      var top: Leaderboard[] = [];

      for (var user of sortedTop) {
        var userRank = sortedTop.findIndex((x) => x.id === user.id) + 1;

        top.push({
          userID: user.id,
          balance: user["balance"],
          bank: user["bank"],
          rank: userRank,
        });
      }

      return res(top);
    });
  }

  /**
   * Method that Initializing Module.
   *
   * @private
   * @returns {Promise<boolean>}
   */
  private async init(): Promise<boolean> {
    return new Promise(async (res, rej) => {
      //? Disabled until release
      // const updater = await this.checkForUpdates();
      // if (typeof updater === "string") {
      //   console.log(updater);
      // }

      var economyOBJ = this.database.database.keys();
      var guildIDS: string[] = [];

      for (var name of economyOBJ) {
        var guildID = name.toString().slice("economy-".length);
        guildIDS.push(guildID);
      }

      for (var guildID of guildIDS) {
        var data = await this.database.get(guildID);

        if (!data) continue;
        if (!data.users) continue;

        for (var user of data.users) {
          if (user.inventory === undefined || !Array.isArray(user.inventory)) {
            user.inventory = [];
          }
        }

        this.database.set(guildID, data);
      }

      return res(true);
    });
  }
}

/**
 * Module Options
 * @typedef {Object} Options
 * @prop {string} [DBName] Economy Database Name
 * @prop {string} [DBPath] Economy Database Path
 * @prop {Rewards} rewards Economy Rewards
 */

/**
 * Economy Rewards
 * @typedef {Object} Rewards
 * @prop {number} daily Daily Reward
 * @prop {number} weekly Weekly Reward
 * @prop {number|number[]} work Work Reward
 */

/**
 * Economy Guild Data
 * @typedef {Object} EconomyGuildData
 * @prop {EconomyUserData[]} users Guild Users Array
 * @prop {EconomyGuildShopItem} shop Guild Shop Array
 */

/**
 * Economy User Data
 * @typedef {Object} EconomyUserData
 * @prop {string} id User ID
 * @prop {number} balance User Balance
 * @prop {number} bank User Bank
 * @prop {EconomyUserRewardsData} rewards User Rewards
 * @prop {EconomyUserInventory[]} inventory User Inventory
 * @prop {EconomyUserHistory[]} history User History
 */

/**
 * Economy User Rewards Data
 * @typedef {Object} EconomyUserRewardsData
 * @prop {EconomyUserRewardObject} daily Daily Reward
 * @prop {EconomyUserRewardObject} weekly Weekly Reward
 * @prop {EconomyUserRewardObject} work Work Reward
 */

/**
 * Economy User Reward Object
 * @typedef {Object} EconomyUserRewardObject
 * @prop {number} amount Amount
 * @prop {number} [collectedAt] Collected At
 * @prop {number} [collectAt] Collect At
 */

/**
 * Economy User Rewards Data
 * @typedef {Object} EconomyUserInventory
 * @prop {number} itemID Item ID
 * @prop {string} name Item Name
 * @prop {string} [description] Item Description
 * @prop {number} cost Item Cost
 * @prop {string} [role] Item Role
 * @prop {number} date Date of Purchase
 */

/**
 * Economy Guild Shop Item
 * @typedef {Object} EconomyGuildShopItem
 * @prop {number} [id] Item ID
 * @prop {string} name Item Name
 * @prop {string} [description] Item Description
 * @prop {number} cost Item Cost
 * @prop {string} [role] Item Role
 */

/**
 * Balance Object for BalanceManager
 * @typedef {Object} BalanceObject
 * @prop {number} amount Amount
 * @prop {BalancePrettyObject} balance User Balance Object
 */

/**
 * Pretty Object for BalanceObject
 * @typedef {Object} BalancePrettyObject
 * @prop {number} before Balance Before
 * @prop {number} after Balance After
 */

/**
 * Deposit Object for BankManager
 * @typedef {Object} DepositObject
 * @prop {number} amount Amount
 * @prop {BalancePrettyObject} balance User Balance Object
 * @prop {DepositPrettyObject} bank User Bank Object
 */

/**
 * Pretty Object for BalanceObject
 * @typedef {Object} DepositPrettyObject
 * @prop {number} before Before Deposit
 * @prop {number} after After Deposit
 */

/**
 * Error Object
 * @typedef {Object} ErrorObject
 * @prop {boolean} status true or false
 * @prop {string} [message] Error Message
 * @prop {any} [data] Object with Data
 */

/**
 * Guild Leaderboard
 * @typedef {Object} Leaderboard
 * @prop {string} userID User ID
 * @prop {number} balance User Balance
 * @prop {number} bank User Bank
 * @prop {number} rank User Rank in Leaderboard
 */

/**
 * Economy User History
 * @typedef {Object} EconomyUserHistory
 * @prop {number} id ID of the Object
 * @prop {ActionType} type Action
 * @prop {number} amount Amount
 * @prop {number} date Date
 */

/**
 * * daily
 * * weekly
 * * work
 * @typedef {string} CooldownType
 */

/**
 * * daily
 * * weekly
 * * work
 * * buy
 * * sell
 * * add
 * * subtract
 * * set
 * * bank-add
 * * bank-subtract
 * * bank-set
 * @typedef {string} ActionType
 */
