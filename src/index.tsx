import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import App from './App';

import { store } from './redux/rootReducer';

render(
  <DndProvider backend={HTML5Backend}>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </DndProvider>,
  document.getElementById('root')
);
