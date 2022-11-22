import ks from "@services/KSAPI";
import { Languages } from "@common";

var md5 = require("md5");

const types = {
  ADD_OFFER_PENDING: "ADD_OFFER_PENDING",
  ADD_OFFER_SUCCESS: "ADD_OFFER_SUCCESS",
  ADD_PHOTOS_PENDING: "ADD_PHOTOS_PENDING",
  ADD_PHOTOS_SUCCESS: "ADD_PHOTOS_SUCCESS",
};

function ConvertURL2(data) {
  var newURL = "";
  Object.keys(data).map((item, index) => {
    newURL += item + ":" + data[item];
  });
  newURL += "KhaledYazeedMohammad";

  return md5(newURL);
}

const initialState = {
  isAdding: false,
  response: null,
  images: [],
  isUploading: false,
  uploadingResponse: "",

  isFetching: false,
};
export const actions = {
  DoAddListing(dispatch, data, images, callback) {
    //  console.log(JSON.stringify(data));
    dispatch({ type: types.ADD_OFFER_PENDING });
    ks.DoAddListing(data).then((responseJson) => {
      if (callback) callback(responseJson);
      if (responseJson.Success) {
        if (!responseJson.IsUserActive) {
          return;
        } else {
          dispatch({
            type: "ADD_OFFER_SUCCESS",
            payload: { response: responseJson },
          });

          if (images && images.length > 0) {
            images.map((image, index) => {
              if (image.uri) {
                //new images only
                fetch(
                  "http://apiv2.autobeeb.com/v2/Services/ListingImageUpload",
                  {
                    method: "POST",
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      pid: responseJson.ID,
                      isPrimary: index == 0 ? true : false,
                      listingType: data.listingType,
                      base64: image.data,
                      filename: image.uri
                        .split("/")
                        [image.uri.split("/").length - 1].split(".")[0],
                      fileextension: image.uri
                        .split("/")
                        [image.uri.split("/").length - 1].split(".")[1],
                    }),
                  }
                );
              }
            });
          }
        }
      }
    });
  },
};

export const reducer = (state = initialState, action) => {
  const { type } = action;

  switch (type) {
    case types.ADD_OFFER_PENDING: {
      return {
        ...state,
        isAdding: true,
      };
    }

    case types.ADD_OFFER_SUCCESS: {
      return {
        ...state,
        response: action.payload,
        isAdding: false,
      };
    }

    case types.ADD_PHOTOS_PENDING:
      return {
        ...state,
        isUploading: true,
      };
    case types.ADD_PHOTOS_SUCCESS:
      return {
        ...state,
        isUploading: false,
        uploadingResponse: action.payload,
        images: [],
      };

    default: {
      return state;
    }
  }
};
