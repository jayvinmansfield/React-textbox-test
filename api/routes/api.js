var Router = require("express");
var knex = require("../db/knex");
var router = Router();

router.get("/locations", function(req, res, next) {
  knex
    .select()
    .from("locations")
    .orderBy("name")
    .then(function(locations) {
      res.send(locations);
    });
});

router.post("/locations", function(req, res, next) {
  knex.transaction(async trx => {
    try {
      await knex("locations")
        .transacting(trx)
        .insert(req.body)
        .returning("id")
        .then(async id => {
          res.json({
            message: "Successfully added Ship",
            status: "success",
            id: id
          }); // Transact (no, not the patches :/) used here so that we can rollback
        });
    } catch (e) {
      await trx.rollback();
      next(e);
    }
  });
});

router.get("/ships", async function(req, res, next) {
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 12;
  const offset = page * (perPage - 1);
  const searchTerm = req.query.search || "";

  var q = knex
    .select(knex.raw("*"))
    .from("ships")
    .orderBy("id");

  if (searchTerm !== "") {
    q.where(
      knex.raw("LOWER(ships.name) like (?)", `%${searchTerm.toLowerCase()}%`)
    );
    q.orWhere(
      knex.raw(
        "LOWER(ships.ref_code) like (?)",
        `%${searchTerm.toLowerCase()}%`
      )
    );
  } else {
    q.limit(perPage);
    q.offset(offset);
  }

  const [resp] = await Promise.all([q]);

  res.json(resp).end();
});

router.get("/ships/count", function(req, res, next) {
  knex.raw(`select count(*) from ships;`).then(function(ships) {
    res.json(ships.rows[0]);
  });
});

router.get("/ship/:id", function(req, res, next) {
  knex
    .select()
    .from("ships")
    .where("id", req.params.id)
    .then(function(ship) {
      res.send(ship[0]);
    });
});

router.post("/ships", function(req, res, next) {
  knex.transaction(async trx => {
    try {
      await knex("ships")
        .transacting(trx)
        .insert(req.body)
        .returning("id")
        .then(async id => {
          res.json({
            message: "Successfully added Ship",
            status: "success",
            id: id
          }); // Transact (no, not the patches :/) used here so that we can rollback
        });
    } catch (e) {
      await trx.rollback();
      next(e);
    }
  });
});

router.patch("/ship/:id", function(req, res, next) {
  knex("ships")
    .where("id", req.params.id)
    .update(req.body)
    .then(function() {
      knex
        .select()
        .orderBy("id")
        .from("ships")
        .then(function(ships) {
          res.send(ships);
        });
    });
});

const cargoSqlWithClient = `select cargo.*, clients.client_name, des_port.name destination_port_name, dep_port.name departure_port_name
from cargo
left join clients on cargo.client_id = clients.id
left join ports as dep_port ON cargo.departure_port_id = dep_port.id
left join ports as des_port ON cargo.destination_port_id = des_port.id
order by id
offset ?`;

router.get("/cargo", async function(req, res, next) {
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 20;
  const offset = page * (perPage - 1);

  const searchTerm = req.query.search || "";

  var q = knex
    .select(
      knex.raw(
        "cargo.*, clients.client_name, des_port.name destination_port_name, dep_port.name departure_port_name"
      )
    )
    .from("cargo")
    .leftOuterJoin(
      "ports as dep_port",
      "cargo.departure_port_id",
      "dep_port.id"
    )
    .leftOuterJoin(
      "ports as des_port",
      "cargo.destination_port_id",
      "des_port.id"
    )
    .leftOuterJoin("clients", "cargo.client_id", "clients.id")
    .orderBy("cargo.id");

  if (searchTerm !== "") {
    q.where(
      knex.raw(
        "LOWER(cargo.cargo_description) like (?)",
        `%${searchTerm.toLowerCase()}%`
      )
    );
    q.orWhere(
      knex.raw("LOWER(dep_port.name) like (?)", `%${searchTerm.toLowerCase()}%`)
    );
    q.orWhere(
      knex.raw("LOWER(des_port.name) like (?)", `%${searchTerm.toLowerCase()}%`)
    );
    q.orWhere(
      knex.raw(
        "LOWER(clients.client_name) like (?)",
        `%${searchTerm.toLowerCase()}%`
      )
    );
  } else {
    q.limit(perPage);
    q.offset(offset);
  }

  const [resp] = await Promise.all([q]);

  res.json(resp).end();
});

router.get("/cargo/count", function(req, res, next) {
  knex.raw(`select count(*) from cargo;`).then(function(cargo) {
    res.json(cargo.rows[0]);
  });
});

router.get("/cargo/:id", function(req, res, next) {
  knex
    .select()
    .from("cargo")
    .where("id", req.params.id)
    .then(function(cargo) {
      res.send(cargo[0]);
    });
});

router.post("/add-cargo", (req, res, next) => {
  knex.transaction(async trx => {
    try {
      await knex("cargo")
        .transacting(trx)
        .insert(req.body)
        .returning("id")
        .then(async id => {
          res.json({
            message: "Successfully added Cargo",
            status: "success",
            id: id
          }); // RETURN INSERTED ORDER ID
        });
    } catch (e) {
      await trx.rollback();
      next(e);
    }
  });
});

router.patch("/update-cargo/:id", (req, res, next) => {
  knex("cargo")
    .where("id", req.params.id)
    .update(req.body)
    .then(function() {
      knex
        .select()
        .orderBy("id")
        .from("cargo")
        .then(function(cargo) {
          res.send(cargo);
        });
    });
});

router.get("/ports", function(req, res, next) {
  const portId = req.query.id || null;
  var q = knex
    .select(knex.raw("ports.*, locations.name as location"))
    .leftOuterJoin("locations", "ports.location_id", "locations.id")
    .orderBy("id")
    .from("ports");
  if (portId !== null) {
    q.where("id", portId);
  }
  q.then(function(ports) {
    if (portId !== null) {
      res.send(ports[0]);
    }
    res.send(ports);
  });
});

router.delete("/ports/:id", function(req, res, next) {
  knex("ports")
    .where("id", req.params.id)
    .del()
    .then(function() {
      knex
        .select()
        .from("ports")
        .then(function(ports) {
          res.send(ports);
        });
    });
});

router.get("/ports/count", function(req, res, next) {
  knex.raw(`select count(*) from ports;`).then(function(clients) {
    res.json(clients.rows[0]);
  });
});

router.get("/clients", async function(req, res, next) {
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 20;
  const offset = page * (perPage - 1);
  const searchTerm = req.query.search || "";

  var q = knex
    .select(knex.raw("clients.*"))
    .from("clients")
    .orderBy("client_name");

  if (searchTerm !== "") {
    q.where(
      knex.raw(
        "LOWER(clients.client_name) like (?)",
        `%${searchTerm.toLowerCase()}%`
      )
    );
    q.orWhere(
      knex.raw(
        "LOWER(clients.client_email) like (?)",
        `%${searchTerm.toLowerCase()}%`
      )
    );
    q.orWhere(
      knex.raw(
        "LOWER(clients.company_name) like (?)",
        `%${searchTerm.toLowerCase()}%`
      )
    );
    q.orWhere(
      knex.raw(
        "LOWER(clients.company_email) like (?)",
        `%${searchTerm.toLowerCase()}%`
      )
    );
    q.orWhere(
      knex.raw(
        "LOWER(clients.contact_number) like (?)",
        `%${searchTerm.toLowerCase()}%`
      )
    );
  } else {
    q.limit(perPage);
    q.offset(offset);
  }
  console.log(q.toString());
  const [resp] = await Promise.all([q]);

  res.json(resp).end();
});

router.get("/clients/count", function(req, res, next) {
  knex.raw(`select count(*) from clients;`).then(function(clients) {
    res.json(clients.rows[0]);
  });
});

router.post("/new-client", (req, res, next) => {
  knex.transaction(async trx => {
    try {
      await knex("clients")
        .transacting(trx)
        .insert(req.body)
        .returning("id")
        .then(async id => {
          res.json({
            message: "Successfully added new client",
            status: "success",
            id: id
          }); // RETURN INSERTED ORDER ID
        });
    } catch (e) {
      await trx.rollback();
      next(e);
    }
  });
});

router.delete("/clients/:id", function(req, res, next) {
  knex("clients")
    .where("id", req.params.id)
    .del()
    .then(function() {
      knex
        .select()
        .from("clients")
        .then(function(clients) {
          res.send(clients);
        });
    });
});

router.delete("/cargo/:id", function(req, res, next) {
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 20;
  const offset = page * (perPage - 1);
  knex("cargo")
    .where("id", req.params.id)
    .del()
    .then(function() {
      knex
        .select(
          knex.raw(
            "cargo.*, clients.client_name, des_port.name destination_port_name, dep_port.name departure_port_name"
          )
        )
        .from("cargo")
        .leftOuterJoin(
          "ports as dep_port",
          "cargo.departure_port_id",
          "dep_port.id"
        )
        .leftOuterJoin(
          "ports as des_port",
          "cargo.destination_port_id",
          "des_port.id"
        )
        .leftOuterJoin("clients", "cargo.client_id", "clients.id")
        .orderBy("cargo.id")
        .limit(perPage)
        .offset(offset)
        .then(function(cargo) {
          res.json(cargo);
        });
    });
});

router.delete("/ship/:id", function(req, res, next) {
  knex("ships")
    .where("id", req.params.id)
    .del()
    .then(function() {
      knex
        .select()
        .from("ships")
        .then(function(ships) {
          res.send(ships);
        });
    });
});

router.post("/fixtures", (req, res, next) => {
  knex.transaction(async trx => {
    try {
      await knex("fixtures")
        .transacting(trx)
        .insert(req.body)
        .returning("id")
        .then(async id => {
          res.json({
            message: "Successfully added new Fixture",
            status: "success",
            id: id
          }); // RETURN INSERTED ORDER ID
        });
    } catch (e) {
      await trx.rollback();
      next(e);
    }
  });
});

const fixturesSql =
  "SELECT fixtures.id, " +
  "fixtures.ship_id, " +
  "fixtures.departure_port_id, " +
  "fixtures.destination_port_id, " +
  "fixtures.ref_number, " +
  "fixtures.location, " +
  "fixtures.status, " +
  "fixtures.expected_arrival, " +
  "fixtures.expected_departure, " +
  "ships.name ship_name, ships.max_weight ship_max_weight, " +
  "ships.ref_code ship_ref_code,dep_port.name departure_port_name, " +
  "des_port.name destination_port_name, sum(cargo_fixtures.weight) current_load " +
  "FROM fixtures " +
  "left JOIN ships ON fixtures.ship_id = ships.id " +
  "left JOIN ports as dep_port ON fixtures.departure_port_id = dep_port.id " +
  "left JOIN ports as des_port ON fixtures.destination_port_id = des_port.id " +
  "left JOIN cargo_fixtures ON fixtures.id = cargo_fixtures.fixture_id ";

const fixturesSqlByGroup =
  " group by " +
  "fixtures.id, " +
  "fixtures.ship_id, " +
  "fixtures.departure_port_id, " +
  "fixtures.destination_port_id, " +
  "fixtures.ref_number, " +
  "fixtures.location, " +
  "fixtures.status, " +
  "fixtures.expected_arrival, " +
  "fixtures.expected_departure, " +
  "ships.name, ships.max_weight, ships.ref_code, dep_port.name, des_port.name";

router.patch("/fixtures/:id", (req, res, next) => {
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 12;
  const offset = page * (perPage - 1);
  knex("fixtures")
    .where("id", req.params.id)
    .update(req.body)
    .then(function() {
      knex
        .raw(fixturesSql + fixturesSqlByGroup + ` offset ${offset}`)
        .then(function(fixtures) {
          res.json(fixtures.rows.slice(0, perPage));
        });
    });
});

router.get("/fixtures", function(req, res, next) {
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 20;
  const offset = page * (perPage - 1);
  const searchTerm = req.query.search || null;

  let sqlToExecute = fixturesSql;

  if (searchTerm !== null) {
    sqlToExecute += `where lower(fixtures.ref_number) like ('%${searchTerm.toLowerCase()}%')`;
    sqlToExecute += ` or lower(dep_port.name) like ('%${searchTerm.toLowerCase()}%')`;
    sqlToExecute += ` or lower(des_port.name) like ('%${searchTerm.toLowerCase()}%')`;
    sqlToExecute += ` or lower(fixtures.status) like ('%${searchTerm.toLowerCase()}%')`;
    sqlToExecute += ` or lower(ships.name) like ('%${searchTerm.toLowerCase()}%')`;
    sqlToExecute += ` or lower(ships.ref_code) like ('%${searchTerm.toLowerCase()}%')`;

    sqlToExecute += fixturesSqlByGroup;
  } else {
    sqlToExecute += fixturesSqlByGroup + ` offset ${offset}`;
  }

  knex.raw(sqlToExecute).then(function(fixtures) {
    res.json(fixtures.rows.slice(0, perPage));
  });
});

router.get("/fixtures/count", function(req, res, next) {
  knex.raw(`select count(*) from fixtures;`).then(function(fixtures) {
    res.json(fixtures.rows[0]);
  });
});

router.get("/fixtures/:id", function(req, res, next) {
  knex
    .select()
    .from("fixtures")
    .where("id", req.params.id)
    .then(function(fixture) {
      res.send(fixture[0]);
    });
});

router.get("/fixtures_with_ports/:id", function(req, res, next) {
  knex
    .raw(
      "SELECT fixtures.id, " +
        "fixtures.ship_id, " +
        "fixtures.departure_port_id, " +
        "fixtures.destination_port_id, " +
        "fixtures.ref_number, " +
        "fixtures.location, " +
        "fixtures.status, " +
        "fixtures.expected_arrival, " +
        "fixtures.expected_departure, " +
        "ships.name ship_name, ships.max_weight ship_max_weight, " +
        "ships.ref_code ship_ref_code,dep_port.name departure_port_name, " +
        "des_port.name destination_port_name, sum(cargo_fixtures.weight) current_load " +
        "FROM fixtures " +
        "left JOIN ships ON fixtures.ship_id = ships.id " +
        "left JOIN ports as dep_port ON fixtures.departure_port_id = dep_port.id " +
        "left JOIN ports as des_port ON fixtures.destination_port_id = des_port.id " +
        "left JOIN cargo_fixtures ON fixtures.id = cargo_fixtures.fixture_id " +
        "where fixtures.id = ?" +
        "group by " +
        "fixtures.id, " +
        "fixtures.ship_id, " +
        "fixtures.departure_port_id, " +
        "fixtures.destination_port_id, " +
        "fixtures.ref_number, " +
        "fixtures.location, " +
        "fixtures.status, " +
        "fixtures.expected_arrival, " +
        "fixtures.expected_departure, " +
        "ships.name, ships.max_weight, ships.ref_code, dep_port.name, des_port.name;",
      req.params.id
    )
    .then(function(fixtures) {
      res.json(fixtures.rows[0]);
    });
});

router.get("/unassigned_cargo/fixture/:id", function(req, res, next) {
  fix = {};
  knex
    .select()
    .from("fixtures")
    .where("id", req.params.id)
    .then(function(fixture) {
      const selectedFixture = fixture[0];
      knex
        .select(
          "cargo.id",
          "cargo.client_id",
          "cargo.departure_port_id",
          "cargo.destination_port_id",
          "cargo.cargo_description",
          "cargo.total_weight",
          "clients.client_name"
        )
        .from("cargo")
        .where("destination_port_id", selectedFixture.destination_port_id)
        .where("departure_port_id", selectedFixture.departure_port_id)
        .leftJoin("clients", "clients.id", "cargo.client_id")
        .then(function(cargos) {
          res.json(cargos);
        });
    });
});

router.get("/cargo_weights_assigned", function(req, res, next) {
  knex
    .raw(`select sum(weight), cargo_id from cargo_fixtures group by cargo_id;`)
    .then(function(weights) {
      res.json(weights.rows);
    });
});

router.patch("/cargo_fixtures/:id", (req, res, next) => {
  knex("cargo_fixtures")
    .where("id", req.params.id)
    .update(req.body)
    .then(function() {
      knex
        .select()
        .orderBy("id")
        .from("cargo_fixtures")
        .then(function(cargo) {
          res.send(cargo);
        });
    });
});

router.post("/cargo_fixtures", (req, res, next) => {
  knex.transaction(async trx => {
    try {
      await knex("cargo_fixtures")
        .transacting(trx)
        .insert(req.body)
        .returning("id")
        .then(async id => {
          res.json({
            message: "Successfully added cargo to Fixture",
            status: "success",
            id: id
          }); // RETURN INSERTED ORDER ID
        });
    } catch (e) {
      await trx.rollback();
      next(e);
    }
  });
});

router.get("/cargo_fixtures/:id", function(req, res, next) {
  knex
    .raw(
      `select 
  cargo_fixtures.id,
  cargo_fixtures.weight,
  cargo.client_id,
  cargo.id as cargo_id,
  cargo.total_weight,
  cargo.cargo_description,
  clients.client_name
  from cargo_fixtures 
  join cargo on cargo_fixtures.cargo_id = cargo.id 
  left join clients on cargo.client_id = clients.id 
  where cargo_fixtures.fixture_id = ?;`,
      req.params.id
    )
    .then(function(cargo_fixtures) {
      res.json(cargo_fixtures.rows);
    });
});

router.delete("/cargo_fixtures/:id/fixture/:fixture_id", function(
  req,
  res,
  next
) {
  knex("cargo_fixtures")
    .where("id", req.params.id)
    .del()
    .then(function() {
      knex
        .raw(
          `select 
  cargo_fixtures.id,
  cargo_fixtures.weight,
  cargo.client_id,
  cargo.total_weight,
  cargo.cargo_description,
  clients.client_name
  from cargo_fixtures 
  join cargo on cargo_fixtures.cargo_id = cargo.id 
  left join clients on cargo.client_id = clients.id 
  where cargo_fixtures.fixture_id = ?;`,
          req.params.fixture_id
        )
        .then(function(cargo) {
          res.json(cargo.rows);
        });
    });
});

module.exports = router;
