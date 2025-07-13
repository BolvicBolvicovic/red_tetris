import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { multiplayerGameSlice } from "./slices/multiplayerGameSlice";
import { soloGameSlice } from "./slices/soloGameSlice";

const rootReducer = combineReducers({
  soloGame: soloGameSlice.reducer,
  multiplayerGame: multiplayerGameSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export slices for components to use
export { soloGameSlice, multiplayerGameSlice };
