import { useState } from 'react';

interface Ability {
  ability: {
    name: string;
  };
}

interface Type {
  type: {
    name: string;
  };
}

interface EvolutionChain {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionChain[];
}

interface Pokemon {
  name: string;
  sprites: {
    front_default: string;
  };
  abilities: Ability[];
  types: Type[];
}

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [evolutions, setEvolutions] = useState<string[]>([]); // El tipo aquí sigue siendo string[]
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (term = searchTerm) => {
    setLoading(true);
    setError(null);

    if (!term) {
      setError('Por favor ingresa un nombre o ID válido');
      setLoading(false);
      return;
    }

    try {
      // Obtención de datos del Pokémon
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${term.toLowerCase()}`);
      if (!response.ok) {
        throw new Error(`Pokémon no encontrado: ${term}`);
      }
      const data: Pokemon = await response.json();
      setPokemon(data);

      // Obtención de los datos de la especie y su cadena evolutiva
      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${term.toLowerCase()}`);
      const speciesData = await speciesResponse.json();
      const evolutionChainUrl = speciesData.evolution_chain.url;

      const evolutionResponse = await fetch(evolutionChainUrl);
      const evolutionData = await evolutionResponse.json();

      // Procesar la cadena evolutiva
      const evolutionNames: string[] = [];
      let currentEvolution: EvolutionChain | null = evolutionData.chain;
      
      while (currentEvolution) {
        evolutionNames.push(currentEvolution.species.name);
        currentEvolution = currentEvolution.evolves_to[0] || null; // Asegurarse de que no sea null
      }

      setEvolutions(evolutionNames);

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Ocurrió un error desconocido');
      }
      setPokemon(null);
      setEvolutions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Búsqueda de Pokémon</h1>
      <input
        type="text"
        placeholder="Ingresa el nombre o número del Pokémon"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={() => handleSearch()}>Buscar</button>

      {loading && <p>Cargando...</p>}

      {error && <p className="error-message">{error}</p>}

      {pokemon && (
        <div className="pokemon-details">
          <div className="pokemon-card">
            <h2>{pokemon.name}</h2>
            <img src={pokemon.sprites.front_default} alt={pokemon.name} />
          </div>

          <h3>Habilidades:</h3>
          <ul>
            {pokemon.abilities.map((ability, index) => (
              <li key={index}>{ability.ability.name}</li>
            ))}
          </ul>

          <h3>Tipo:</h3>
          <ul>
            {pokemon.types.map((type, index) => (
              <li key={index}>{type.type.name}</li>
            ))}
          </ul>

          <h3>Evoluciones:</h3>
          <ul className="evolution-list">
            {evolutions.map((evolution, index) => (
              <li
                key={index}
                className="li-evo"
                onClick={() => handleSearch(evolution)}
              >
                {evolution}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
