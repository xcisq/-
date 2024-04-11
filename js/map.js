function mapping(type, options) {
  L.TileLayer.ChinaProvider = L.TileLayer.extend({
    initialize: function (type, options) { // (type, Object)
      var providers = L.TileLayer.ChinaProvider.providers;
      var parts = type.split('.');
      var providerName = parts[0];
      var mapName = parts[1];
      var mapType = parts[2];
      var url = providers[providerName][mapName][mapType];
      options.subdomains = providers[providerName].Subdomains;
      options.attribution = providers[providerName].attribution;
      L.TileLayer.prototype.initialize.call(this, url, options);
    }
  });
  L.TileLayer.ChinaProvider.providers = {
    TianDiTu: {
      Normal: {
        Map: "https://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=a8479c5bd1fd7b84c5a72669ed79a95b",
        Annotion: "https://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=a8479c5bd1fd7b84c5a72669ed79a95b"
      },
      Satellite: {
        Map: "https://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=a8479c5bd1fd7b84c5a72669ed79a95b",
        Annotion: "https://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=a8479c5bd1fd7b84c5a72669ed79a95b"
      },
      Terrain: {
        Map: "https://t{s}.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=a8479c5bd1fd7b84c5a72669ed79a95b",
        Annotion: "https://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=a8479c5bd1fd7b84c5a72669ed79a95b"
      },
      Subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      attribution: "地图数据&copy;天地图"
    },
    GaoDe: {
      Normal: {
        Map: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      },
      Satellite: {
        Map: 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
        Annotion: 'https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}'
      },
      Subdomains: ["1", "2", "3", "4"],
      // attribution: "地图数据&copy;高德地图"
    },
    Google: {
      Normal: {
        Map: "https://mt{s}.google.cn/vt/lyrs=m&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}"
      },
      Satellite: {
        Map: "https://mt{s}.google.cn/vt/lyrs=s&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}"
      },
      Terrain: {
        Map: "https://mt{s}.google.cn/vt/lyrs=t&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}"
      },
      Subdomains: ["0", "1", "2", "3"],
      attribution: "地图数据&copy;谷歌地图"
    },
    Geoq: {
      Normal: {
        Map: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}",
        Color: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetColor/MapServer/tile/{z}/{y}/{x}",
        PurplishBlue: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
        Gray: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}",
        Warm: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}",
        Cold: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetCold/MapServer/tile/{z}/{y}/{x}"
      },
      Subdomains: [],
      attribution: "地图数据&copy;智图地图"
    }
  };
  return new L.TileLayer.ChinaProvider(type, options);
}