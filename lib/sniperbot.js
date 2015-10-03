'use strict';

var util = require('util');
var request = require('request');
var Bot = require('slackbots');

/**
 * Constructor function. It accepts a settings object which should contain the following keys:
 *      token : the API token of the bot (mandatory)
 *      name : the name of the bot (will default to "sniper")
 *
 * @param {object} settings
 * @constructor
 */
var SniperBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'sniper';

    this.user = null;
};

// inherits methods and properties from the Bot constructor
util.inherits(SniperBot, Bot);

/**
 * Run the bot
 * @public
 */
SniperBot.prototype.run = function () {
    SniperBot.super_.call(this, this.settings);

    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

/**
 * On Start callback, called when the bot connects to the Slack server and access the channel
 * @private
 */
SniperBot.prototype._onStart = function () {
    this._loadBotUser();
};

/**
 * On message callback, called when a message (of any type) is detected with the real time messaging API
 * @param {object} message
 * @private
 */
SniperBot.prototype._onMessage = function (message) {
    if (!this._isChatMessage(message) ||
        !this._isChannelConversation(message) ||
        this._isFromSniperBot(message)
    ) {
        return false;
    }
    switch (true) {
        case this._haveMapOrVersionIn(message):
            this._replyWithLastMap(message);
            break;
        case this._haveSniperIn(message):
            this._replyWithDefaultQuote(message);
            break;
    };
};

/**
 * Replyes to a message with a last map
 * @param {object} originalMessage
 * @private
 */
SniperBot.prototype._replyWithLastMap = function (originalMessage) {
    var self = this;
    request('http://www.getdota.com', function (error, response, body) {
        var channel = self._getChannelById(originalMessage.channel),
            res = body.match(/(\d{1,2}\.\d{1,2}\D?)/);
        if (!error && response.statusCode == 200 && res) {
            var channel = self._getChannelById(originalMessage.channel);
            self.postMessageToChannel(channel.name, "แมพล่าสัส v" + res[0] + " เชื่อกูดิ กูส่องทุกวัน", {as_user: true});
        };
    });
};

/**
 * Replyes to a message with a default qoute
 * @param {object} originalMessage
 * @private
 */
SniperBot.prototype._replyWithDefaultQuote = function (originalMessage) {
    var channel = this._getChannelById(originalMessage.channel),
        messages = [
            "แทง จิ๊กโก๋",
            "อ้ายเซ่อ!",
            "แปบดิสัส กูคูลดาวน์อยู่.."
        ],
        message = messages[(Math.floor(Math.random() * 10 % messages.length))];
    this.postMessageToChannel(channel.name, message, {as_user: true});
};

/**
 * Loads the user object representing the bot
 * @private
 */
SniperBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

/**
 * Util function to check if a given real time message object represents a chat message
 * @param {object} message
 * @returns {boolean}
 * @private
 */
SniperBot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

/**
 * Util function to check if a given real time message object is directed to a channel
 * @param {object} message
 * @returns {boolean}
 * @private
 */
SniperBot.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C'
        ;
};

/**
 * Util function to check if a given real time message has ben sent by the sniperbot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
SniperBot.prototype._isFromSniperBot = function (message) {
    return message.user === this.user.id;
};

/**
 * Util function to check if a given real time message have the word as map or version
 * @param {object} message
 * @returns {boolean}
 * @private
 */
SniperBot.prototype._haveMapOrVersionIn = function (message) {
    return !!message.text.toLowerCase().match(/(map|แมพ|version|เวอ(ร์)?ชั่น)/);
};

/**
 * Util function to check if a given real time message have the word as sniper
 * @param {object} message
 * @returns {boolean}
 * @private
 */
SniperBot.prototype._haveSniperIn = function (message) {
    return !!message.text.toLowerCase().match(/(sni(per)?|สไน(เปอ(ร์)?)?)/);
};

/**
 * Util function to get the name of a channel given its id
 * @param {string} channelId
 * @returns {Object}
 * @private
 */
SniperBot.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

module.exports = SniperBot;
