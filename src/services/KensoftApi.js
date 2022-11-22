/**
 * init class API
 * @param opt
 * @returns {KensoftApi}
 * @constructor
 */
function KensoftApi(opt) {
  if (!(this instanceof KensoftApi)) {
    return new KensoftApi(opt);
  }
  opt = opt || {};
  this.classVersion = "1.0.0";
  this._setDefaultsOptions(opt);
}

KensoftApi.prototype._request = function(url, callback) {
  // console.log(url);
  //var self = this;
  return fetch(url)
    .then((response) => response.text()) // Convert to text instead of res.json()
    .then((response) => JSON.parse(response))
    .then((responseData) => {
      if (typeof callback == "function") {
        callback(responseData);
      }
      // console.log("request result from " + url, responseData);
      return responseData;
    })
    .catch((error) => {
      // ////console.log('2=error network -- ', error.message);
    });
};

KensoftApi.prototype._requestPost = function(url, data, callback) {
  //var self = this;
  // console.log(url);
  // console.log(JSON.stringify(data));
  var params = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  };
  return fetch(url, params)
    .then((response) => response.json())
    .then((responseData) => {
      if (typeof callback == "function") {
        callback(responseData);
      }
      //  console.log("request result from " + url, responseData);

      return responseData;
    })
    .catch((error) => {
      //////console.log('error network', error.message);
    });
};

KensoftApi.prototype.join = function(obj, separator, ignoreCur = false) {
  var arr = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      arr.push(key + "=" + obj[key]);
    }
  }
  if (global.ViewingCurrency && global.ViewingCurrency.ID && !ignoreCur) {
    arr.push("cur=" + global.ViewingCurrency.ID);
  }

  return arr.join(separator);
};

/**
 * Default option
 * @param opt
 * @private
 */
KensoftApi.prototype._setDefaultsOptions = async function(opt) {
  this.url = opt.url;
};

// ConvertURL = (data) => {
//   var newURL = "";
//   Object.keys(data).map((item, index) => {
//     newURL += item + ":" + data[item];
//   });
//   newURL += "KhaledYazeedMohammad";

//   return md5(newURL);
// };

KensoftApi.prototype.HomeScreenGet = function(data) {
  var requestUrl = "";

  if (data) {
    requestUrl = this.join(data, "&");
  } else {
    requestUrl = "parent=0";
  }

  var requestUrl = this.url + "/services/HomeScreenGet?";
  requestUrl += this.join(data, "&", true);
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //console.log (requestUrl);
  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.UpdateUser = function(data, callback, noEmbed) {
  var embedText = "_embed";
  if (typeof noEmbed !== "undefined") {
    embedText = "";
  }

  var requestUrl = this.url + "/services/UpdateUser?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this.request(requestUrl, callback);
};

KensoftApi.prototype.getCommunication = function(data, callback) {
  var requestUrl = this.url + "/services/MessagingGetCommunication?newchat=1&";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.SendMessage = function(data, callback) {
  var requestUrl = this.url + "/services/MessagingSend?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.getMessageSessions = function(data, callback) {
  var requestUrl = this.url + "/services/MessagingGetSessions?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.SetUserToken = function(data, callback) {
  var requestUrl = this.url + "/services/SetUserToken?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};
KensoftApi.prototype.getFacebookUser = function(data, callback) {
  var requestUrl = this.url + "/services/getFacebookUser?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //////console.log(requestUrl)

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.facebookLogin = function(data, callback) {
  var requestUrl = this.url + "/services/facebookLogin?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // ////console.log(requestUrl)

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.GoogleSignin = function(data, callback) {
  var requestUrl = this.url + "/services/emaillogin?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // ////console.log(requestUrl)

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.GoogleRegister = function(data, callback) {
  var requestUrl = this.url + "/services/emailregister?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //////console.log(requestUrl);

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.MakesGet = function(data, callback) {
  var requestUrl = this.url + "/services/MakesGet?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //console.log(requestUrl);

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.ModelsGet = function(data, callback) {
  var requestUrl = this.url + "/services/ModelsGet?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //console.log(requestUrl);

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.TypeCategoriesGet = function(data, callback) {
  var requestUrl = this.url + "/services/TypeCategoriesGet?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //console.log(requestUrl);

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.ColorsGet = function(data, callback) {
  var requestUrl = this.url + "/services/ColorsGet?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //////console.log(requestUrl);

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.CitiesGet = function(data, callback) {
  var requestUrl = this.url + "/services/CitiesGet?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //////console.log(requestUrl);

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.DoAddListing = function(data, callback) {
  var requestUrl = this.url + "/services/DoAddListing?";

  //////console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.AddPendingTransaction = function(data, callback) {
  //console.log(data);
  var requestUrl = this.url + "/services/AddPendingTransaction?";

  //////console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.CompleteTransaction = function(data, callback) {
  //console.log(data);
  var requestUrl = this.url + "/services/CompleteTransaction?";

  //////console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.ListingTypesGet = function(data, callback) {
  var requestUrl = this.url + "/services/ListingTypesGet?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //////console.log(requestUrl);

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.CountriesGet = function(data, callback) {
  var requestUrl = this.url + "/services/CountriesGet?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //////console.log(requestUrl);

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.ListingsGet = function(data, callback) {
  var requestUrl = this.url + "/services/ListingsGet?";
  requestUrl += this.join(data, "&", true);
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //console.log (requestUrl);

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.AuthStart = function(data, callback) {
  var requestUrl = this.url + "/services/AuthStart?";

  //////console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.LoginUser = function(data, callback) {
  var requestUrl = this.url + "/services/LoginUser?";
  //requestUrl += this.join(data, "&");

  ////console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.UserVerifyOTP = function(data, callback) {
  var requestUrl = this.url + "/services/UserVerifyOTP?";
  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.ResendOTP = function(data, callback) {
  var requestUrl = this.url + "/services/ResendOTP?";
  // requestUrl += this.join(data, "&");

  ////console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.QuickSearch = function(data, callback) {
  var requestUrl = this.url + "/Services/QuickSearch?";
  //  requestUrl += this.join(data, "&");

  ////console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.ForgotPasswordInit = function(data, callback) {
  var requestUrl = this.url + "/Services/ForgotPasswordInit?";
  //  requestUrl += this.join(data, "&");

  ////console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.ConfirmResetCode = function(data, callback) {
  var requestUrl = this.url + "/Services/ConfirmResetCode?";
  // requestUrl += this.join(data, "&");

  ////console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.ChangePassword = function(data, callback) {
  var requestUrl = this.url + "/Services/ChangePassword?";
  //requestUrl += this.join(data, "&");

  ////console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.UploadImage = function(data, callback) {
  var requestUrl = this.url + "/Services/UploadImage?";
  // requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.UpdateInfo = function(data, callback) {
  var requestUrl = this.url + "/Services/UpdateInfo?";
  //requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.ConfirmOTPAndUpdate = function(data, callback) {
  var requestUrl = this.url + "/Services/ConfirmOTPAndUpdate?";
  // requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.ClassificationsGet = function(data, callback) {
  var requestUrl = this.url + "/Services/ClassificationsGet?";
  //requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.MakesMulitpleTypesGet = function(data, callback) {
  var requestUrl = this.url + "/Services/MakesMulitpleTypesGet?";
  //requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.CompetencesGet = function(data, callback) {
  var requestUrl = this.url + "/Services/CompetencesGet?";
  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};
KensoftApi.prototype.BecomeADealer = function(data, callback) {
  var requestUrl = this.url + "/Services/BecomeADealer?";
  //requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.CountryGet = function(data, callback) {
  var requestUrl = this.url + "/Services/CountryGet?";
  // requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.DealerGet = function(data, callback) {
  var requestUrl = this.url + "/Services/DealerGet?";
  //requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.UserGet = function(data, callback) {
  var requestUrl = this.url + "/Services/UserGet?";
  //requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.DealersGet = function(data, callback) {
  var requestUrl = this.url + "/Services/DealersGet?";
  requestUrl += this.join(data, "&");

  // console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.UserListings = function(data, callback) {
  if (global.ViewingCurrency && global.ViewingCurrency.ID) {
    var requestUrl = `${this.url}/Services/UserListings?cur=${global.ViewingCurrency.ID}`;
    data.cur = global.ViewingCurrency.ID;
  } else {
    var requestUrl = this.url + "/Services/UserListings?";
  }

  //requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.DeleteOffer = function(data, callback) {
  var requestUrl = this.url + "/Services/DeleteOffer?";
  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};
KensoftApi.prototype.OfferUpdateStatus = function(data, callback) {
  var requestUrl = this.url + "/Services/OfferUpdateStatus?";
  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.RenewOffer = function(data, callback) {
  var requestUrl = this.url + "/Services/RenewOffer?";
  requestUrl += this.join(data, "&"); // when i comment this the Post request stops working, ill check back with mohammed

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.TransferListing = function(data, callback) {
  var requestUrl = this.url + "/Services/TransferListing?";
  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.FeaturesGet = function(data, callback) {
  var requestUrl = this.url + "/Services/FeaturesGet?";
  // requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.FeatureSetAdd = function(data, callback) {
  var requestUrl = this.url + "/Services/FeatureSetAdd?";
  // requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.ListingEditGet = function(data, callback) {
  var requestUrl = this.url + "/Services/ListingEditGet?";
  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.ListingImageDelete = function(data, callback) {
  var requestUrl = this.url + "/Services/ListingImageDelete?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.EmailRegister = function(data, callback) {
  var requestUrl = this.url + "/Services/EmailRegister?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.EmailLogin = function(data, callback) {
  var requestUrl = this.url + "/Services/EmailLogin?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};
KensoftApi.prototype.AppleLogin = function(data) {
  var requestUrl = "";
  if (data) {
    requestUrl = this.join(data, "&");
  } else {
    requestUrl = "parent=0";
  }
  var requestUrl = this.url + "/services/AppleLogin?" + requestUrl;

  return this._request(requestUrl).then(function(data) {
    return data;
  });
};

KensoftApi.prototype.CheckFacebookUser = function(data, callback) {
  var requestUrl = this.url + "/Services/CheckFacebookUser?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.FacebookLogin = function(data, callback) {
  var requestUrl = this.url + "/Services/FacebookLogin?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.SocialMediaImage = function(data, callback) {
  var requestUrl = this.url + "/Services/SocialMediaImage?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};
KensoftApi.prototype.EmailLogin = function(data, callback) {
  var requestUrl = this.url + "/Services/EmailLogin?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.EmailRegister = function(data, callback) {
  var requestUrl = this.url + "/Services/EmailRegister?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.QuickSearch = function(data, callback) {
  var requestUrl = this.url + "/Services/QuickSearch?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.FreeSearch = function(data, callback) {
  if (global.ViewingCurrency && global.ViewingCurrency.ID) {
    var requestUrl = `${this.url}/Services/FreeSearch?cur=${global.ViewingCurrency.ID}`;
  } else {
    var requestUrl = this.url + "/Services/FreeSearch?";
  }

  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};
KensoftApi.prototype.SetUserToken = function(data, callback) {
  var requestUrl = this.url + "/Services/SetUserToken?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.SendMessage = function(data, callback) {
  var requestUrl = this.url + "/Services/SendMessage?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.getMessageSessions = function(data, callback) {
  var requestUrl = this.url + "/Services/getMessageSessions?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.getCommunication = function(data, callback) {
  var requestUrl = this.url + "/Services/getCommunication?newchat=1&";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);
  console.log(requestUrl + JSON.stringify(data));
  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.hideCommunication = function(data, callback) {
  var requestUrl = this.url + "/Services/hideCommunication?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.WatchlistAdd = function(data, callback) {
  var requestUrl = this.url + "/Services/WatchlistAdd?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};
KensoftApi.prototype.WatchlistGet = function(data, callback) {
  var requestUrl = this.url + "/Services/WatchlistGet?";
  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.AddEntitySession = function(data, callback) {
  var requestUrl = this.url + "/Services/AddEntitySession?";
  //  requestUrl += this.join(data, "&");

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.ListingInitInfo = function(data, callback) {
  var requestUrl = "http://apiv2.autobeeb.com/v2/Services/ListingInitInfo?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.BannerClick = function(data, callback) {
  var requestUrl = this.url + "/Services/BannerClick?";
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, (response) => {
    return response;
  });
};

KensoftApi.prototype.CurrenciesGet = function(data, callback, noEmbed) {
  var embedText = "_embed";
  if (typeof noEmbed !== "undefined") {
    embedText = "";
  }

  var requestUrl = this.url + "/services/CurrenciesGet?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this._request(requestUrl, callback);
};

KensoftApi.prototype.ListingGet = function(data, callback, noEmbed) {
  var embedText = "_embed";
  if (typeof noEmbed !== "undefined") {
    embedText = "";
  }

  var requestUrl = this.url + "/services/ListingGet?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this._request(requestUrl, callback);
};

// KensoftApi.prototype.ListingGet = function (data, callback) {
//   var requestUrl = this.url + "/services/ListingGet?";
//   requestUrl += this.join(data, "&");

//   //console.log(requestUrl);

//   return this._requestPost(requestUrl, data, (response) => {
//     return response;
//   });
// };

KensoftApi.prototype.CurrencyGetByISOCode = function(data, callback, noEmbed) {
  var embedText = "_embed";
  if (typeof noEmbed !== "undefined") {
    embedText = "";
  }

  var requestUrl = this.url + "/services/CurrencyGetByISOCode?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this._request(requestUrl, callback);
};

KensoftApi.prototype.PrimaryCurrenciesGet = function(data, callback, noEmbed) {
  var embedText = "_embed";
  if (typeof noEmbed !== "undefined") {
    embedText = "";
  }

  var requestUrl = this.url + "/services/PrimaryCurrenciesGet?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this._request(requestUrl, callback);
};

KensoftApi.prototype.BannersGet = function(data, callback, noEmbed) {
  var embedText = "_embed";
  if (typeof noEmbed !== "undefined") {
    embedText = "";
  }

  var requestUrl = this.url + "/services/BannersGet?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // console.log(requestUrl);
  return this._request(requestUrl, callback);
};

KensoftApi.prototype.ArticlesGet = function(data, callback, noEmbed) {
  var embedText = "_embed";
  if (typeof noEmbed !== "undefined") {
    embedText = "";
  }
  var requestUrl = this.url + "/services/ArticlesGet?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // console.log(requestUrl);
  return this._request(requestUrl, callback);
};

KensoftApi.prototype.ArticleGet = function(data, callback, noEmbed) {
  var embedText = "_embed";
  if (typeof noEmbed !== "undefined") {
    embedText = "";
  }
  var requestUrl = this.url + "/services/ArticleGet?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // console.log(requestUrl);
  return this._request(requestUrl, callback);
};

KensoftApi.prototype.ArticleCategoriesGet = function(data, callback, noEmbed) {
  var embedText = "_embed";
  if (typeof noEmbed !== "undefined") {
    embedText = "";
  }
  var requestUrl = this.url + "/services/ArticleCategoriesGet?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // console.log(requestUrl);
  return this._request(requestUrl, callback);
};

KensoftApi.prototype.PlansGet = function(data, callback, noEmbed) {
  var embedText = "_embed";
  if (typeof noEmbed !== "undefined") {
    embedText = "";
  }
  var requestUrl = this.url + "/services/PlansGet?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // console.log(requestUrl);
  return this._request(requestUrl, callback);
};

KensoftApi.prototype.GenerateClientToken = function(data, callback, noEmbed) {
  var embedText = "_embed";
  if (typeof noEmbed !== "undefined") {
    embedText = "";
  }
  var requestUrl = this.url + "/services/GenerateClientToken?";
  requestUrl += this.join(data, "&");
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // console.log(requestUrl);
  return this._request(requestUrl, callback);
};

KensoftApi.prototype.ReportListing = function(data, callback, noEmbed) {
  var embedText = "_embed";
  if (typeof noEmbed !== "undefined") {
    embedText = "";
  }
  var requestUrl = this.url + "/services/AddReport?";
  requestUrl += this.join(data, "&");

  return this._request(requestUrl, callback);
};

export default KensoftApi;
