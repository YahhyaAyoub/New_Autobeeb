/**
 * Created by Kensoftware on 14/02/2017.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const types = {
   EDIT_CHAT: 'EDIT_CHAT',
 };
 
 export const actions =(payload)=> {
   return{
      type:types.EDIT_CHAT,
      payload
   }
 };
 
 const initialState = {
   chat: false,
 };

 
 export const reducer = (state = initialState, action) => {
 
   switch (action.type) {
      case types.EDIT_CHAT: {

          AsyncStorage.setItem('@chatIconDot', action.payload?'true':'false');

          return {
              ...state,
              chat:action.payload
          };
      }
      default: {
         return state;
      }
   }
 };
 