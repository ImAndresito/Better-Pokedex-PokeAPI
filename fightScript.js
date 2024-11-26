document.addEventListener('DOMContentLoaded', function () {
  const searchLeft = document.getElementById('search-left');
  const suggestionsLeft = document.getElementById('suggestions-left');
  const selectLeftButton = document.getElementById('select-left');
  const randomLeftButton = document.getElementById('random-left');
  const searchRight = document.getElementById('search-right');
  const suggestionsRight = document.getElementById('suggestions-right');
  const selectRightButton = document.getElementById('select-right');
  const randomRightButton = document.getElementById('random-right');
  const fightButton = document.getElementById('fight-button');
  const fightLog = document.getElementById('fight-log');
  const firstTurnDropdown = document.getElementById('first-turn');

  let leftStats = null;
  let rightStats = null;
  let pokemonList = [];
  let originalLeftStats = null;
  let originalRightStats = null;

  function fetchPokemonList() {
    return fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        return data.results;
      });
  }

  function fetchPokemonDetails(id) {
    return fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then((response) => response.json())
      .then((data) => ({
        name: data.name,
        hp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        sprite: data.sprites.front_default,
        moves: data.moves.slice(0, 4).map((move) => move.move.name),
        types: data.types.map((typeInfo) => typeInfo.type.name),
      }));
  }

  function fetchMoveDetails(moveName) {
    return fetch(`https://pokeapi.co/api/v2/move/${moveName}`)
      .then((response) => response.json())
      .then((data) => ({
        name: data.name,
        power: data.power || 50,
        type: data.type.name,
      }))
      .catch(() => ({ name: moveName, power: 50, type: 'normal' }));
  }

  function fetchTypeEffectiveness(attackingType, defendingTypes) {
    return fetch(`https://pokeapi.co/api/v2/type/${attackingType}`)
      .then((response) => response.json())
      .then((data) => {
        let multiplier = 1;
        defendingTypes.forEach((defendingType) => {
          if (
            data.damage_relations.double_damage_to.some(
              (type) => type.name === defendingType
            )
          )
            multiplier *= 2;
          if (
            data.damage_relations.half_damage_to.some(
              (type) => type.name === defendingType
            )
          )
            multiplier *= 0.5;
          if (
            data.damage_relations.no_damage_to.some(
              (type) => type.name === defendingType
            )
          )
            multiplier *= 0;
        });
        return multiplier;
      });
  }

  function showSuggestions(input, suggestionsBox, side) {
    const query = input.value.toLowerCase();
    suggestionsBox.innerHTML = '';
    if (query.length === 0) {
      return;
    }
    const matches = pokemonList.filter(function (pokemon) {
      return pokemon.name.startsWith(query);
    });
    matches.forEach((pokemon) => {
      const suggestion = document.createElement('div');
      suggestion.classList.add('suggestion');
      suggestion.textContent = pokemon.name;
      suggestion.addEventListener('click', function () {
        input.value = pokemon.name;
        suggestionsBox.innerHTML = '';
        const id = pokemonList
          .find((p) => p.name === pokemon.name)
          .url.split('/')
          .slice(-2)[0];
        loadPokemonStats(id, side);
      });
      suggestionsBox.appendChild(suggestion);
    });
  }

  function loadPokemonStats(pokemonId, side) {
    fetchPokemonDetails(pokemonId).then(function (pokemon) {
      const stats = {
        name: pokemon.name,
        hp: pokemon.hp,
        attack: pokemon.attack,
        sprite: pokemon.sprite,
        moves: pokemon.moves,
        types: pokemon.types,
      };
      const card = document.getElementById(`pokemon-${side}-card`);
      card.innerHTML = `
                  <img src="${stats.sprite}" alt="${
        stats.name
      }" class="pokemon-icon">
                  <h2>${stats.name}</h2>
                  <p id="${side}-hp">HP: ${stats.hp}</p>
                  <p id="${side}-attack">Attack: ${stats.attack}</p>
                  <div id="${side}-moves">
                      ${stats.moves
                        .map(
                          (move, index) => `
                          <button class="move-button" data-move="${move}" data-side="${side}" data-index="${index}">${move}</button>
                      `
                        )
                        .join('')}
                  </div>
              `;
      if (side === 'left') {
        leftStats = { ...stats };
        originalLeftStats = { ...stats };
      } else {
        rightStats = { ...stats };
        originalRightStats = { ...stats };
      }
    });
  }

  function calculateAttack(attacker, defender, move) {
    return fetchMoveDetails(move).then((moveDetails) =>
      fetchTypeEffectiveness(moveDetails.type, defender.types).then(
        (effectiveness) => {
          const baseDamage = moveDetails.power || 50;
          const attackStat = attacker.attack;
          const damage = Math.floor((attackStat * baseDamage) / 200) + 2;
          return Math.floor(damage * effectiveness);
        }
      )
    );
  }

  function resetStats() {
    if (originalLeftStats) {
      leftStats = { ...originalLeftStats };
      document.getElementById('left-hp').textContent = `HP: ${leftStats.hp}`;
    }
    if (originalRightStats) {
      rightStats = { ...originalRightStats };
      document.getElementById('right-hp').textContent = `HP: ${rightStats.hp}`;
    }
  }

  function startFight() {
    fightLog.innerHTML = '<p>The battle begins!</p>';

    if (battleEnded) {
      resetStats();
      document
        .querySelectorAll('.move-button')
        .forEach((button) => (button.disabled = false));
      battleEnded = false;
      fightLog.innerHTML = '<p>The battle begins anew!</p>';
      return;
    }

    if (!leftStats || !rightStats) {
      fightLog.innerHTML =
        '<p>Please select both Pokémon before starting the fight.</p>';
      return;
    }

    battleEnded = false;
  }

  randomLeftButton.addEventListener('click', function () {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    loadPokemonStats(randomId, 'left');
  });

  randomRightButton.addEventListener('click', function () {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    loadPokemonStats(randomId, 'right');
  });

  searchLeft.addEventListener('input', function () {
    showSuggestions(searchLeft, suggestionsLeft, 'left');
  });

  searchRight.addEventListener('input', function () {
    showSuggestions(searchRight, suggestionsRight, 'right');
  });

  selectLeftButton.addEventListener('click', function () {
    const selectedPokemon = searchLeft.value.toLowerCase();
    const pokemon = pokemonList.find((p) => p.name === selectedPokemon);
    if (pokemon) {
      const id = pokemon.url.split('/').slice(-2)[0];
      loadPokemonStats(id, 'left');
    }
  });

  selectRightButton.addEventListener('click', function () {
    const selectedPokemon = searchRight.value.toLowerCase();
    const pokemon = pokemonList.find((p) => p.name === selectedPokemon);
    if (pokemon) {
      const id = pokemon.url.split('/').slice(-2)[0];
      loadPokemonStats(id, 'right');
    }
  });

  fightButton.addEventListener('click', startFight);

  fetchPokemonList()
    .then(function (pokemons) {
      pokemonList = pokemons;
    })
    .catch(function (error) {
      console.error('Error fetching Pokémon list:', error);
    });

  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('move-button')) {
      const move = event.target.dataset.move;
      const side = event.target.dataset.side;
      const attacker = side === 'left' ? leftStats : rightStats;
      const defender = side === 'left' ? rightStats : leftStats;

      calculateAttack(attacker, defender, move).then(function (damage) {
        defender.hp -= damage;
        document.getElementById(
          `${side === 'left' ? 'right' : 'left'}-hp`
        ).textContent = `HP: ${Math.max(defender.hp, 0)}`;

        fightLog.innerHTML += `<p>${
          attacker.name
        } used ${move} for ${damage} damage! ${defender.name} has ${Math.max(
          defender.hp,
          0
        )} HP left.</p>`;

        if (defender.hp <= 0) {
          fightLog.innerHTML += `<p>${attacker.name} wins!</p>`;
          document
            .querySelectorAll('.move-button')
            .forEach((button) => (button.disabled = true));
          battleEnded = true;
          return;
        }
      });
    }
  });
});
