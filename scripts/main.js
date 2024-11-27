document.addEventListener('DOMContentLoaded', () => {
  const pokemonListElement = document.getElementById('pokemon-list');
  const $CHANGE_SPRITE_BUTTON = document.getElementById('change_sprite_button');
  const $SEARCH_POKEMON = document.getElementById('search_pokemon');

  let spritesUrl = 'home.front_default';
  $CHANGE_SPRITE_BUTTON.addEventListener('click', () => {
    if (spritesUrl === 'home.front_default') {
      spritesUrl = 'official-artwork.front_default';
    } else {
      spritesUrl = 'home.front_default';
    }

    fetchAndDisplayPokemons();
  });

  const fetchAndDisplayPokemons = () => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1302')
      .then((response) => response.json())
      .then((data) => {
        const pokemons = data.results;
        pokemons.sort((a, b) => a.name.localeCompare(b.name));

        pokemonListElement.innerHTML = '';

        pokemons.forEach((pokemon) => {
          const pokemonCard = document.createElement('div');
          pokemonCard.classList.add('pokemon-card');
          pokemonCard.innerHTML = `
            <img class="pokemon-sprite" src="" alt="${pokemon.name} sprite">
            <h2 class="pokemon-name">${pokemon.name}</h2>
            <div class="type-container"></div>
            <button class="btn view-details" data-id="${pokemon.name}"><i class="fa-solid fa-plus"></i></i>INFO</button>
            <div class="pokemon-card1"></div>`;
          pokemonListElement.appendChild(pokemonCard);

          fetch(pokemon.url)
            .then((response) => response.json())
            .then((pokemonDetails) => {
              const splitUrl = spritesUrl.split('.');
              const URL_SPRITE = splitUrl.reduce(
                (accumulator, key) => accumulator[key],
                pokemonDetails.sprites.other
              );

              const SPRITE = pokemonCard.querySelector('.pokemon-sprite');
              SPRITE.src = URL_SPRITE;

              const POKEMON_TYPES = pokemonDetails.types;

              POKEMON_TYPES.forEach((typeInfo) => {
                const { type } = typeInfo;
                fetch(type.url)
                  .then((response) => response.json())
                  .then((data) => {
                    const $POKEMON_TYPES_CONTAINER =
                      pokemonCard.querySelector('.type-container');
                    const TYPE_SPRITE =
                      data.sprites['generation-viii'][
                        'brilliant-diamond-and-shining-pearl'
                      ]['name_icon'];
                    // const TYPE_SPRITE =
                    //   data.sprites['generation-ix']['scarlet-violet'][
                    //     'name_icon'
                    //   ];

                    const TYPE_IMG = document.createElement('img');
                    TYPE_IMG.src = TYPE_SPRITE;
                    $POKEMON_TYPES_CONTAINER.classList.add('d-flex');
                    $POKEMON_TYPES_CONTAINER.appendChild(TYPE_IMG);
                  });
              });
            })
            .catch((error) => {
              console.error('Error fetching Pokémon details:', error);
            });

          pokemonCard
            .querySelector('.view-details')
            .addEventListener('click', () => {
              window.location.href = `pokemon.html?id=${pokemon.name}`;
            });
        });
        $SEARCH_POKEMON.addEventListener('input', () => {
          let searchKey = $SEARCH_POKEMON.value.toLowerCase();
          console.log(searchKey);
          const filterPokemons = pokemons.filter((pokemon) =>
            pokemon.name.toLowerCase().includes(searchKey)
          );
          pokemonListElement.innerHTML = '';

          filterPokemons.forEach((pokemon) => {
            const pokemonCard = document.createElement('div');
            pokemonCard.classList.add('pokemon-card');
            pokemonCard.innerHTML = `
            <img class="pokemon-sprite" src="" alt="${pokemon.name} sprite">
            <h2 class="pokemon-name">${pokemon.name}</h2>
            <div class="type-container"></div>
            <button class="btn view-details" data-id="${pokemon.name}"><i class="fa-solid fa-plus"></i></i>INFO</button>
            <div class="pokemon-card1"></div>`;
            pokemonListElement.appendChild(pokemonCard);

            fetch(pokemon.url)
              .then((response) => response.json())
              .then((pokemonDetails) => {
                const splitUrl = spritesUrl.split('.');
                const URL_SPRITE = splitUrl.reduce(
                  (accumulator, key) => accumulator[key],
                  pokemonDetails.sprites.other
                );

                const SPRITE = pokemonCard.querySelector('.pokemon-sprite');
                SPRITE.src = URL_SPRITE;

                const POKEMON_TYPES = pokemonDetails.types;

                POKEMON_TYPES.forEach((typeInfo) => {
                  const { type } = typeInfo;
                  fetch(type.url)
                    .then((response) => response.json())
                    .then((data) => {
                      const $POKEMON_TYPES_CONTAINER =
                        pokemonCard.querySelector('.type-container');
                      const TYPE_SPRITE =
                        data.sprites['generation-viii'][
                          'brilliant-diamond-and-shining-pearl'
                        ]['name_icon'];

                      const TYPE_IMG = document.createElement('img');
                      TYPE_IMG.src = TYPE_SPRITE;
                      $POKEMON_TYPES_CONTAINER.classList.add('d-flex');
                      $POKEMON_TYPES_CONTAINER.appendChild(TYPE_IMG);
                    });
                });
              })
              .catch((error) => {
                console.error('Error fetching Pokémon details:', error);
              });
          });
        });
      })
      .catch((error) => {
        console.error('Error fetching Pokémon data:', error);
        pokemonListElement.textContent = 'Failed to load pokémon.';
      });
  };

  fetchAndDisplayPokemons();
});
