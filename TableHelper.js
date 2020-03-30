import React from 'react'

export const fetchRows = (props) => {

    switch (props.tableName) {
      case 'plots':
        return props.fetchPlots();
      case 'jobs':
        return props.fetchJobs();
      case 'chemicals':
        return props.fetchChemicals();
      case 'users':
        return props.fetchUsers();
      case 'aircrafts':
        return props.fetchAircrafts();
      default:
        break;
    }
  }

export const deleteRows = (props, ids) => {

    switch (props.tableName) {
      case 'plots':
        return props.deletePlots(ids)
      case 'jobs':
        return props.deleteJobs(ids)
      case 'chemicals':
        return props.deleteChemicals(ids)
      case 'users':
        return props.deleteUsers(ids)
      case 'aircrafts':
        return props.deleteAircrafts(ids)
      default:
        break;
    }
  }

export const updateRow = (props, newRow) => {

  switch (props.tableName) {
      case 'plots':
        return props.updatePlot(newRow)
      case 'jobs':
        return props.updateJob(newRow)
      case 'chemicals':
        return props.updateChemical(newRow)
      case 'users':
        return props.updateUser(newRow)
      case 'aircrafts':
        return props.updateAircraft(newRow)
      default:
      break;
}
}

export const createRow = (props, newRow) => {

  switch (props.tableName) {
    case 'plots':
      return props.createPlot(newRow)
    case 'jobs':
      return props.createJob(newRow)
    case 'chemicals':
      return props.createChemical(newRow)
    case 'users':
      return props.createUser(newRow)
    case 'aircrafts':
      return props.createAircraft(newRow)
    default:
      break;
  }
}

export const renderChemicals = (chemicals) => {
  return <ul style={{listStyle: 'none', margin: 0, padding: 0, whiteSpace: 'pre'}}>
    {chemicals.map(chem => {
      const measurementType = chem['solid?'] ? 'kgs/hectare' : 'ltrs/hectare';
      return <React.Fragment key={chem}>
              <li>{chem.name}</li>
              <li>- {chem.application_rate} {measurementType}</li>
            </React.Fragment>
    })}
  </ul>
}

export const renderPolygon = (vertices) => {
  return <ul style={{listStyle: 'none', margin: 0, padding: 0, whiteSpace: 'pre'}}>
    {vertices.map((vertex, i) => {
      return <li key={vertex + i}>{vertex}</li>
    })}
  </ul>
}
