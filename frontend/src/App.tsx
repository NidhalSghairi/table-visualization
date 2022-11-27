import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import axios from "axios";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import {
  PageWrapper,
  SelectColumnContainer,
  SelectColumnText,
  NbNonDisplayedValuesText,
} from "./App.style";

type ColumnRow = {
  id: string;
  count: number;
  averageAge: number;
};

// The list of databases.
const DATABASES = ["us-census"];

function App() {
  const columns: GridColDef[] = [
    { field: "id", headerName: "Value", width: 330 },
    { field: "count", headerName: "Count", width: 130 },
    {
      field: "averageAge",
      headerName: "Average age",
      width: 230,
    },
  ];

  const [selectedDataBase, setSelectedDataBase] = useState("");

  const [selectedColumn, setSelectedColumn] = useState("");

  const [selectedColumnValues, setSelectedColumnValues] = useState<ColumnRow[]>(
    []
  );

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedColumn(event.target.value);
  };

  const [allColumnsNames, setAllColumnsNames] = useState<string[]>([]);
  const [nbNonDisplayedValues, setNbNonDisplayedValues] = useState(0);

  const handleSaveValues = (data: ColumnRow[]) => {
    const filteredData = data
      .filter((row: ColumnRow) => row.id)
      .map((row: ColumnRow) => {
        row.averageAge = Number(row.averageAge.toFixed(1));
        return row;
      });

    setNbNonDisplayedValues(
      filteredData.length > 100 ? filteredData.length - 100 : 0
    );

    setSelectedColumnValues(filteredData.slice(0, 100));
  };

  // We should refetch columns names every time the database changes.
  useEffect(() => {
    axios
      .get("http://localhost:8000/columns", {
        params: {
          database: selectedDataBase,
        },
      })
      .then((res) => setAllColumnsNames(Object.keys(res.data[0])));
  }, [selectedDataBase]);

  useEffect(() => {
    if (selectedColumn) {
      axios
        .get("http://localhost:8000/values", {
          params: {
            column: selectedColumn,
            database: selectedDataBase,
          },
        })
        .then((res) => handleSaveValues(res.data));
    }
  }, [selectedColumn, selectedDataBase]);

  return (
    <PageWrapper>
      <SelectColumnContainer>
        <SelectColumnText>Select a database</SelectColumnText>
        <Select
          value={selectedDataBase}
          onChange={(event: SelectChangeEvent) => {
            setSelectedDataBase(event.target.value);
          }}
          autoWidth
        >
          {DATABASES.map((databaseName) => {
            return (
              <MenuItem value={databaseName} key={databaseName}>
                {databaseName}
              </MenuItem>
            );
          })}
        </Select>
      </SelectColumnContainer>
      {selectedDataBase && (
        <div>
          <SelectColumnContainer>
            <SelectColumnText>Select a column name</SelectColumnText>
            <Select
              labelId="demo-simple-select-autowidth-label"
              id="demo-simple-select-autowidth"
              value={selectedColumn}
              onChange={handleChange}
              autoWidth
            >
              {allColumnsNames.map((columnName) => {
                return (
                  <MenuItem value={columnName} key={columnName}>
                    {columnName}
                  </MenuItem>
                );
              })}
            </Select>
          </SelectColumnContainer>
          <DataGrid
            rows={selectedColumnValues}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            autoHeight
            sortModel={[{ field: "count", sort: "desc" }]}
          />
          {nbNonDisplayedValues > 0 && (
            <NbNonDisplayedValuesText>
              The number of non displayed values is : {nbNonDisplayedValues}
            </NbNonDisplayedValuesText>
          )}
        </div>
      )}
    </PageWrapper>
  );
}

export default App;
