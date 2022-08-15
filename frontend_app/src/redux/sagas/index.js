import { all, fork } from 'redux-saga/effects';
import userSaga from './user.js';
import projectsSaga from './projects.js';
import modelsSaga from './models.js';
import labelprojectsSaga from './labelprojects.js';
import groupsSaga from './groups.js';

export default function* rootSaga() {
  yield all([
    fork(userSaga),
    fork(labelprojectsSaga),
    fork(projectsSaga),
    fork(modelsSaga),
    fork(groupsSaga)
  ]);
}
