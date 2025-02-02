import { Routes } from '@angular/router';
import { TetrisComponent } from './tetris/tetris.component';
import { HomeComponent } from './home/home.component';
import { MultiplayerComponent } from './multiplayer/multiplayer.component';

export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "multiplayer", component: MultiplayerComponent },
  { path: "solo", component: TetrisComponent }
];
