import { combineReducers } from 'redux';
import user from './user.js';
import projects from './projects.js';
import models from './models.js';
import labelprojects from './labelprojects.js';
import messages from './messages.js';
import groups from './groups.js';


const rootReducer = (state, action) => {
  switch (action.type) {
    default: {
      const combinedReducer = combineReducers({
        user,
        projects,
        models,
        labelprojects,
        messages,
        groups
      });
      return combinedReducer(state, action);
    }
  }
};

export default rootReducer;
