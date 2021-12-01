import React, { useState, useEffect } from "react";
import * as RB from "react-bootstrap";
import Multiselect from "multiselect-react-dropdown";
import * as axios from "axios";
import { Map as LeafletMap, TileLayer, Rectangle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const client = axios.create({
  baseURL: "http://127.0.0.1:3001/",
  timeout: 5000,
});

const INITIAL_POSITION = [-22, -45];
const INITIAL_ZOOM = 7;

function App() {
  const [searchType, setSearchType] = useState(null);
  const [aerodromesData, setAerodromesData] = useState([]);

  const [selectedAerodromes, setSelectedAerodromes] = useState([]);
  const [selectedArea, setSelectedArea] = useState([]);

  const [selectedFields, setSelectedFields] = useState([]);

  const [order1, setOrder1] = useState(null);
  const [order2, setOrder2] = useState(null);
  const [order3, setOrder3] = useState(null);
  const [order4, setOrder4] = useState(null);
  const [asc1, setAsc1] = useState(null);
  const [asc2, setAsc2] = useState(null);
  const [asc3, setAsc3] = useState(null);
  const [asc4, setAsc4] = useState(null);

  const [extraMetar, setExtraMetar] = useState(false);
  const [extraTaf, setExtraTaf] = useState(false);

  const [limit, setLimit] = useState(100);

  const [searchData, setSearchData] = useState(null);

  useEffect(() => {
    client.get("/aerodromes_list").then((res) => {
      setAerodromesData(
        res.data.slice(0, 1000).map((item) => ({
          label: item.code + " - " + item.name,
          code: item.code,
          latitude: item.latitude,
          longitude: item.longitude,
        }))
      );

      console.log("Dados de aerodromos carregados");
    });
  }, []);

  const searchAdhoc = () => {
    const params = {};
    if (searchType === "nome") {
      params.codes = selectedAerodromes.join(",");
    } else {
      params.region = selectedArea.map((item) => item.join(",")).join(";");
    }

    params.fields = selectedFields.join(",");

    const orders = [];
    if (order1 && asc1) {
      orders.push(order1 + "," + asc1);
    }
    if (order2 && asc2) {
      orders.push(order2 + "," + asc2);
    }
    if (order3 && asc3) {
      orders.push(order3 + "," + asc3);
    }
    if (order4 && asc4) {
      orders.push(order4 + "," + asc4);
    }

    if (orders.length > 0) {
      params.order = orders.join(";");
    }

    params.metar = extraMetar;
    params.taf = extraTaf;

    params.limit = limit;

    client
      .get("/adhoc", { params })
      .then((res) => {
        setSearchData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    console.log("Busca realizada");
  };

  console.log(searchData);

  return (
    <div className="app">
      <RB.Navbar bg="dark" variant="dark" expand="lg" fixed="top">
        <RB.Container>
          <RB.Navbar.Brand href=".">Início</RB.Navbar.Brand>
          <RB.Navbar.Toggle aria-controls="basic-navbar-nav" />
          <RB.Navbar.Collapse id="basic-navbar-nav">
            <RB.Nav className="me-auto">
              <RB.Nav.Link
                href="https://github.com/cristianob/trabalho-db2"
                target="_blank"
              >
                GitHub
              </RB.Nav.Link>
            </RB.Nav>
          </RB.Navbar.Collapse>
        </RB.Container>
      </RB.Navbar>

      <div className="wrapper">
        <div className="aerodrome-search">
          <h2>Escolha dos aeródromos</h2>

          <RB.ButtonGroup aria-label="Basic example">
            <RB.Button
              variant={searchType === "nome" ? "primary" : "secondary"}
              onClick={() => {
                setSearchType("nome");
                setSelectedAerodromes([]);
              }}
            >
              Nome
            </RB.Button>
            <RB.Button
              variant={searchType === "regiao" ? "primary" : "secondary"}
              onClick={() => {
                setSearchType("regiao");
                setSelectedArea([]);
              }}
            >
              Região
            </RB.Button>
          </RB.ButtonGroup>
        </div>

        {searchType === "nome" && (
          <div className="searchNome">
            <Multiselect
              options={aerodromesData}
              displayValue="label"
              placeholder="Selecione os aeródromos"
              onSelect={(aerodromes) =>
                setSelectedAerodromes(aerodromes.map((item) => item.code))
              }
              onRemove={(aerodromes) =>
                setSelectedAerodromes(aerodromes.map((item) => item.code))
              }
              showArrow
              showCheckbox
            />
          </div>
        )}

        {searchType === "regiao" && (
          <div className="searchMap">
            <LeafletMap
              center={INITIAL_POSITION}
              zoom={INITIAL_ZOOM}
              style={{ width: "100%", height: "100%" }}
              onclick={(event) => {
                if (selectedArea.length === 0) {
                  setSelectedArea([[event.latlng.lat, event.latlng.lng]]);
                  return;
                }

                if (selectedArea.length === 1) {
                  setSelectedArea([
                    selectedArea[0],
                    [event.latlng.lat, event.latlng.lng],
                  ]);
                  return;
                }

                setSelectedArea([]);
              }}
            >
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {selectedArea.length === 1 && (
                <Rectangle bounds={[selectedArea[0], selectedArea[0]]} />
              )}
              {selectedArea.length === 2 && (
                <Rectangle
                  bounds={selectedArea}
                  pathOptions={{ color: "blue" }}
                />
              )}
            </LeafletMap>
          </div>
        )}

        <div className="fieldBlock">
          <h2>Campos</h2>

          <Multiselect
            options={[
              { label: "Código", value: "code" },
              { label: "Nome", value: "name" },
              { label: "Latitude", value: "latitude" },
              { label: "Longitude", value: "longitude" },
            ]}
            displayValue="label"
            placeholder="Selecione os campos"
            onSelect={(aerodromes) =>
              setSelectedFields(aerodromes.map((item) => item.value))
            }
            onRemove={(aerodromes) =>
              setSelectedFields(aerodromes.map((item) => item.value))
            }
            showArrow
            showCheckbox
          />
        </div>

        <div className="fieldBlock">
          <h2>Ordenação</h2>

          <div className="sortFields">
            <div className="sortField">
              <RB.Form.Control
                as="select"
                onChange={(event) => {
                  if (event.target.value !== "") {
                    setOrder1(event.target.value);
                  } else {
                    setOrder1(null);
                  }
                }}
              >
                <option value=""></option>
                <option value="code">Código</option>
                <option value="name">Nome</option>
                <option value="latitude">Latitude</option>
                <option value="longitude">Longitude</option>
              </RB.Form.Control>
              <RB.Form.Control
                as="select"
                onChange={(event) => {
                  if (event.target.value !== "") {
                    setAsc1(event.target.value);
                  } else {
                    setAsc1(null);
                  }
                }}
              >
                <option value=""></option>
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </RB.Form.Control>
            </div>

            <div className="sortField">
              <RB.Form.Control
                as="select"
                onChange={(event) => {
                  if (event.target.value !== "") {
                    setOrder2(event.target.value);
                  } else {
                    setOrder2(null);
                  }
                }}
              >
                <option value=""></option>
                <option value="code">Código</option>
                <option value="name">Nome</option>
                <option value="latitude">Latitude</option>
                <option value="longitude">Longitude</option>
              </RB.Form.Control>
              <RB.Form.Control
                as="select"
                onChange={(event) => {
                  if (event.target.value !== "") {
                    setAsc2(event.target.value);
                  } else {
                    setAsc2(null);
                  }
                }}
              >
                <option value=""></option>
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </RB.Form.Control>
            </div>

            <div className="sortField">
              <RB.Form.Control
                as="select"
                onChange={(event) => {
                  if (event.target.value !== "") {
                    setOrder3(event.target.value);
                  } else {
                    setOrder3(null);
                  }
                }}
              >
                <option value=""></option>
                <option value="code">Código</option>
                <option value="name">Nome</option>
                <option value="latitude">Latitude</option>
                <option value="longitude">Longitude</option>
              </RB.Form.Control>
              <RB.Form.Control
                as="select"
                onChange={(event) => {
                  if (event.target.value !== "") {
                    setAsc3(event.target.value);
                  } else {
                    setAsc3(null);
                  }
                }}
              >
                <option value=""></option>
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </RB.Form.Control>
            </div>

            <div className="sortField">
              <RB.Form.Control
                as="select"
                onChange={(event) => {
                  if (event.target.value !== "") {
                    setOrder4(event.target.value);
                  } else {
                    setOrder4(null);
                  }
                }}
              >
                <option value=""></option>
                <option value="code">Código</option>
                <option value="name">Nome</option>
                <option value="latitude">Latitude</option>
                <option value="longitude">Longitude</option>
              </RB.Form.Control>
              <RB.Form.Control
                as="select"
                onChange={(event) => {
                  if (event.target.value !== "") {
                    setAsc4(event.target.value);
                  } else {
                    setAsc4(null);
                  }
                }}
              >
                <option value=""></option>
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </RB.Form.Control>
            </div>
          </div>
        </div>

        <div className="fieldBlock">
          <h2>Itens adicionais</h2>

          <RB.Form.Check
            type="checkbox"
            label="METAR (Meteorologia em tempo presente)"
            checked={extraMetar}
            onChange={(event) => setExtraMetar(event.target.checked)}
          />
          <RB.Form.Check
            type="checkbox"
            label="TAF (Previsão meteorológica)"
            checked={extraTaf}
            onChange={(event) => setExtraTaf(event.target.checked)}
          />
        </div>

        <div className="fieldBlock">
          <h2>Limite de registros</h2>

          <RB.Form.Control
            type="text"
            placeholder="Limite"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
          />
        </div>

        <div className="fieldBlock">
          <RB.Button
            variant="primary"
            onClick={() => searchAdhoc()}
            disabled={
              !(
                (selectedAerodromes.length > 0 || selectedArea.length === 2) &&
                selectedFields.length > 0 &&
                limit
              )
            }
          >
            Pesquisar
          </RB.Button>
        </div>
      </div>

      <RB.Modal
        show={searchData}
        dialogClassName="modal-90w"
        onHide={() => setSearchData(null)}
      >
        <RB.Modal.Header closeButton>
          <RB.Modal.Title id="contained-modal-title-vcenter">
            Resultados da pesquisa
          </RB.Modal.Title>
        </RB.Modal.Header>
        <RB.Modal.Body>
          {searchData && searchData.length > 0 && (
            <RB.Table striped bordered hover>
              <thead>
                <tr key={"header"}>
                  {Object.keys(searchData[0]).map((key) => (
                    <th>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {searchData.map((item) => (
                  <tr key={item.id}>
                    {Object.values(item).map((val) => (
                      <td>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </RB.Table>
          )}
        </RB.Modal.Body>
      </RB.Modal>
    </div>
  );
}
export default App;
