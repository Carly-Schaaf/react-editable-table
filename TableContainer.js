import { connect } from 'react-redux';
import DBTable from './Table';
import { createJob, updateJob, fetchJobs, deleteJobs } from '../../actions/job_actions';
import { createChemical, updateChemical, fetchChemicals, deleteChemicals } from '../../actions/chemical_actions';
import { createPlot, updatePlot, fetchPlots, deletePlots } from '../../actions/plot_actions';
import { updateUser, fetchUsers, deleteUsers } from '../../actions/user_actions';
import { signup } from '../../actions/session_actions';
import { toggleEditState } from '../../actions/ui_actions';
import { createAircraft, updateAircraft, fetchAircrafts, deleteAircrafts } from '../../actions/aircraft_actions';
import { clearAllErrors, fetchColumns } from '../../actions/ui_actions';
import { addRow } from '../../actions/table_actions';

const mstp = (state, ownProps) => ({
    rows: Object.values(state.entities[ownProps.tableName])
});

export default connect(mstp, { 
    fetchChemicals, 
    fetchJobs, 
    fetchAircrafts, 
    fetchUsers, 
    fetchPlots, 
    deletePlots,
    deleteChemicals, 
    deleteJobs, 
    deleteAircrafts, 
    deleteUsers,
    createPlot,
    createChemical, 
    createJob, 
    createAircraft, 
    createUser: (user) => signup(user, true),
    updatePlot,
    updateChemical, 
    updateJob, 
    updateAircraft, 
    updateUser,
    toggleEditState,
    clearAllErrors,
    addRow,
    fetchColumns
})(DBTable);