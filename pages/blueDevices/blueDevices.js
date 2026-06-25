
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const FILTER_ENABLED_KEY = 'deviceFilterEnabled';
const FILTER_PREFIX_KEY = 'deviceFilterPrefix';

Page({
  data: {
    deviceList: [],
    allDevices: {},
    filterEnabled: true,
    filterPrefix: 'BLUFI',
    deviceId: "",
  },
  bindViewConnect: function (event) {
    var self = this,
      deviceId = event.currentTarget.dataset.value;
    self.setData({
      deviceId: deviceId
    });
    wx.navigateTo({
      url: '/pages/blueWifi/blueWifi?deviceId=' + deviceId,
    })
  },
  loadFilterSettings: function () {
    var storedEnabled = wx.getStorageSync(FILTER_ENABLED_KEY);
    var storedPrefix = wx.getStorageSync(FILTER_PREFIX_KEY);
    var filterEnabled = storedEnabled === '' ? app.data.filterEnabled !== false : !!storedEnabled;
    var filterPrefix = storedPrefix || app.data.deviceFilterPrefix || app.data.name || 'BLUFI';
    this.setData({
      filterEnabled: filterEnabled,
      filterPrefix: filterPrefix,
    });
  },
  getFilterOptions: function () {
    return {
      filterEnabled: this.data.filterEnabled,
      prefix: this.data.filterPrefix,
    };
  },
  getAllDeviceList: function () {
    var allDevices = this.data.allDevices;
    var list = [];
    for (var deviceId in allDevices) {
      if (allDevices.hasOwnProperty(deviceId)) {
        list.push(allDevices[deviceId]);
      }
    }
    return list;
  },
  refreshDeviceList: function () {
    var list = util.filterDevice(this.getAllDeviceList(), 'name', this.getFilterOptions());
    if (list.length > 0) {
      wx.hideLoading();
    }
    this.setData({
      deviceList: list,
    });
  },
  mergeDevices: function (devices) {
    var allDevices = this.data.allDevices;
    for (var i = 0; i < devices.length; i++) {
      var device = devices[i];
      if (device.deviceId) {
        allDevices[device.deviceId] = device;
      }
    }
    this.setData({
      allDevices: allDevices,
    });
    this.refreshDeviceList();
  },
  saveFilterSettings: function () {
    wx.setStorageSync(FILTER_ENABLED_KEY, this.data.filterEnabled);
    wx.setStorageSync(FILTER_PREFIX_KEY, this.data.filterPrefix);
  },
  bindFilterEnabledChange: function (event) {
    this.setData({
      filterEnabled: event.detail.value,
    });
    this.saveFilterSettings();
    this.refreshDeviceList();
  },
  bindFilterPrefixInput: function (event) {
    this.setData({
      filterPrefix: event.detail.value,
    });
  },
  bindFilterPrefixConfirm: function () {
    this.saveFilterSettings();
    this.refreshDeviceList();
  },
  getBluDevice: function () {
    var self = this;
    wx.getBluetoothDevices({
      success: function (res) {
        self.mergeDevices(res.devices);
      }
    })
    wx.onBluetoothDeviceFound(function (res) {
      console.log(res.devices[0].name);
      self.mergeDevices(res.devices);
    })
  },

  onLoad: function () {
    var self = this;
    wx.setNavigationBarTitle({
      title: 'BluFi扫描'
    });
    self.loadFilterSettings();
    wx.showLoading({
      title: '设备扫描中...',
    })
    self.getBluDevice();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var self = this,
      deviceId = self.data.deviceId;
    if (!util._isEmpty(deviceId)) {
      wx.closeBLEConnection({
        deviceId: deviceId,
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

})