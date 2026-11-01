/**
 * src/app/core/data/places.ts
 *
 * Datos de respaldo (fallback) de los lugares patrimoniales, usados cuando el
 * backend no responde. `core/models` es la única fuente de verdad del tipo
 * `Lugar`, así que este archivo ya no declara su propia interface.
 *
 * Corrección respecto a la versión React: el Teatro Colón traía
 * `category: 'Danza'` (con minúscula inicial) mientras que el enum `CategoriaLugar`
 * y el filtro de la vista Cultura usan `'DANZA'`. Con `strict` de TypeScript
 * eso era un error de tipos que en React se escondía tras un `as any`, y hacía
 * que el Teatro Colón nunca apareciera al filtrar por DANZA. Aquí va `'DANZA'`.
 */
import type { Lugar } from '../models';

export const places: Lugar[] = [
  // ==========================================
  // PERÚ (5 lugares)
  // ==========================================
  {
    id: 'mali',
    name: 'Museo de Arte de Lima',
    country: 'PE',
    coords: [-12.06, -77.037],
    category: 'ARTE',
    icon: 'palette',
    period: '1961',
    desc: 'El MALI, ubicado en el histórico Palacio de la Exposición, alberga 3000 años de arte peruano, desde piezas precolombinas hasta arte contemporáneo.',
    img: 'https://exploortrip.com/wp-content/uploads/2025/11/Museo-de-Arte-de-Lima-Maliaaaa-900x450.jpg',
  },
  {
    id: 'bellasartesperu',
    name: 'Escuela Nacional Superior Autónoma de Bellas Artes',
    country: 'PE',
    coords: [-12.045, -77.027],
    category: 'ARTE',
    icon: 'palette',
    period: '1918',
    desc: 'Principal centro de formación artística del Perú, fundado por Daniel Hernández.',
    img: 'https://noti-america.com/site/peru/wp-content/uploads/sites/8/2021/09/Fachada-de-Bellas-28-9-.jpg',
  },
  {
    id: 'machu',
    name: 'Santuario de Machu Picchu',
    country: 'PE',
    coords: [-13.163, -72.545],
    category: 'ARQUEOLOGIA',
    icon: 'landmark',
    period: 'Siglo XV',
    desc: 'Magistral obra de arquitectura e ingeniería paisajística Inca.',
    img: 'https://www.peru-explorer.com/wp-content/uploads/machu-picchu-5.jpg',
  },
  {
    id: 'sanmarcos',
    name: 'Universidad Nacional Mayor de San Marcos',
    country: 'PE',
    coords: [-12.056, -77.082], // Corregido a las coordenadas reales en Lima
    category: 'PATRIMONIO',
    icon: 'landmark',
    period: '1551',
    desc: 'La primera universidad en ser fundada oficialmente por real provisión y autorizada por real cédula en América.',
    img: 'https://www.rcrperu.com/wp-content/uploads/2023/03/unmsm-1.jpg',
  },
  {
    id: 'larco',
    name: 'Museo Larco',
    country: 'PE',
    coords: [-12.073, -77.071],
    category: 'ARQUEOLOGIA',
    icon: 'landmark',
    period: '1926',
    desc: 'Ubicado en una mansión virreinal, exhibe la más impresionante colección de oro, plata y arte erótico del antiguo Perú.',
    img: 'https://content.emarket.pe/common/collections/content/2c/3c/2c3c56b0-5866-493c-997c-c47bf0dd65be.png',
  },

  // ==========================================
  // MÉXICO (5 lugares)
  // ==========================================
  {
    id: 'sancarlos',
    name: 'Academia de San Carlos',
    country: 'MX',
    coords: [19.432, -99.129],
    category: 'ARTE',
    icon: 'palette',
    period: '1781',
    desc: 'Primera escuela de arte de América. De sus aulas surgieron los grandes maestros del muralismo mexicano.',
    img: 'https://th.bing.com/th/id/R.37174ba9b3c451c8f618eb6a99014408?rik=IMWzEyHpWzN%2f2A&pid=ImgRaw&r=0',
  },
  {
    id: 'bellasartesmx',
    name: 'Palacio de Bellas Artes',
    country: 'MX',
    coords: [19.436, -99.141],
    category: 'ARTE',
    icon: 'palette',
    period: '1934',
    desc: 'Máximo recinto cultural de México, famoso por sus espectaculares murales interiores y su arquitectura Art Déco y Art Nouveau.',
    img: 'https://th.bing.com/th/id/R.917bcd0faa605dbd0123a48e3da1da9f?rik=NrR6yUWD2kAC1A&pid=ImgRaw&r=0',
  },
  {
    id: 'antropologia',
    name: 'Museo Nacional de Antropología',
    country: 'MX',
    coords: [19.426, -99.186],
    category: 'ARQUEOLOGIA',
    icon: 'landmark',
    period: '1964',
    desc: 'El museo más grande de México, salvaguarda el inmenso legado arqueológico de los pueblos de Mesoamérica.',
    img: 'https://aws-tiqets-cdn.imgix.net/images/content/536d804429c6498e8bcfebe1c7a5c5a8.jpeg?auto=format&fit=crop&q=75&w=900',
  },
  {
    id: 'chichen',
    name: 'Chichén Itzá',
    country: 'MX',
    coords: [20.684, -88.567],
    category: 'ARQUEOLOGIA',
    icon: 'landmark',
    period: 'Siglo VI',
    desc: 'Legendaria ciudad maya, hogar de la pirámide de Kukulcán, catalogada como una de las maravillas del mundo moderno.',
    img: 'https://a.cdn-hotels.com/gdcs/production190/d280/7f708d89-efcb-40b2-9fd6-eaaf4c1594ef.jpg',
  },
  {
    id: 'unam',
    name: 'Ciudad Universitaria (UNAM)',
    country: 'MX',
    coords: [19.327, -99.182],
    category: 'PATRIMONIO',
    icon: 'landmark',
    period: '1952',
    desc: 'Campus central de la universidad más grande de América Latina, Patrimonio de la Humanidad por su magistral integración de arquitectura y muralismo.',
    img: 'https://unamsa.edu/wp-content/uploads/2022/12/221205-aca2-des-f1-dos-obras-en-una.jpg',
  },

  // ==========================================
  // ARGENTINA (5 lugares)
  // ==========================================
  {
    id: 'teatrocolon',
    name: 'Teatro Colón',
    country: 'AR',
    coords: [-34.601, -58.383],
    category: 'DANZA',
    icon: 'music',
    period: '1908',
    desc: 'Uno de los teatros de ópera y ballet más importantes del mundo, famoso globalmente por su acústica excepcional.',
    img: 'https://tse4.mm.bing.net/th/id/OIP.5MO3XEGR1MqXYZBjujecYwHaFA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    id: 'mnba',
    name: 'Museo Nacional de Bellas Artes',
    country: 'AR',
    coords: [-34.584, -58.393],
    category: 'ARTE',
    icon: 'palette',
    period: '1895',
    desc: 'Alberga el mayor patrimonio artístico del país y una de las colecciones de arte europeo más importantes de América Latina.',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Museo_Nacional_de_Bellas_Artes_%28Buenos_Aires%29.jpg/800px-Museo_Nacional_de_Bellas_Artes_%28Buenos_Aires%29.jpg',
  },
  {
    id: 'malba',
    name: 'MALBA',
    country: 'AR',
    coords: [-34.576, -58.402],
    category: 'ARTE',
    icon: 'palette',
    period: '2001',
    desc: 'El Museo de Arte Latinoamericano de Buenos Aires está dedicado íntegramente a preservar y difundir el arte de la región desde inicios del siglo XX.',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Malba-museum.jpg/800px-Malba-museum.jpg',
  },
  {
    id: 'cuevamanos',
    name: 'Cueva de las Manos',
    country: 'AR',
    coords: [-47.155, -70.655],
    category: 'ARQUEOLOGIA',
    icon: 'palette',
    period: '7300 a.C.',
    desc: 'Impresionante sitio arqueológico en la Patagonia profunda, famoso por el arte rupestre que estampa las manos de antiguos cazadores-recolectores.',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Cueva_de_las_Manos_1.jpg/800px-Cueva_de_las_Manos_1.jpg',
  },
  {
    id: 'uba',
    name: 'Universidad de Buenos Aires',
    country: 'AR',
    coords: [-34.599, -58.373],
    category: 'PATRIMONIO',
    icon: 'landmark',
    period: '1821',
    desc: 'Prestigiosa y masiva institución pública de educación superior, de cuyas aulas han egresado varios premios Nobel latinoamericanos.',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Facultad_de_Derecho_de_la_Universidad_de_Buenos_Aires.jpg/800px-Facultad_de_Derecho_de_la_Universidad_de_Buenos_Aires.jpg',
  },

  // ==========================================
  // GUATEMALA (5 lugares)
  // ==========================================
  {
    id: 'tikal', name: 'Parque Nacional Tikal', country: 'GT', coords: [17.222, -89.623],
    category: 'ARQUEOLOGIA', icon: 'landmark', period: 'Siglo IV a.C.', desc: 'Una de las mayores ciudades mayas de la época clásica, inmersa en la selva petenera.', img: 'https://picsum.photos/seed/tikal/800/500'
  },
  {
    id: 'antigua_gt', name: 'Antigua Guatemala', country: 'GT', coords: [14.555, -90.733],
    category: 'PATRIMONIO', icon: 'building', period: '1543', desc: 'Ciudad colonial excepcionalmente conservada, rodeada de volcanes y famosa por su arquitectura renacentista española.', img: 'https://picsum.photos/seed/antigua_gt/800/500'
  },
  {
    id: 'palacio_cultura_gt', name: 'Palacio Nacional de la Cultura', country: 'GT', coords: [14.642, -90.513],
    category: 'PATRIMONIO', icon: 'building', period: '1943', desc: 'Símbolo del centro histórico de la capital, mezcla de estilos arquitectónicos y sede de importantes murales.', img: 'https://picsum.photos/seed/palacio_cultura_gt/800/500'
  },
  {
    id: 'museo_ixchel', name: 'Museo Ixchel del Traje Indígena', country: 'GT', coords: [14.606, -90.504],
    category: 'ARTE', icon: 'palette', period: '1973', desc: 'Preserva y exhibe la rica tradición textil indígena de Guatemala.', img: 'https://picsum.photos/seed/museo_ixchel/800/500'
  },
  {
    id: 'quirigua', name: 'Parque Arqueológico Quiriguá', country: 'GT', coords: [15.266, -89.040],
    category: 'ARQUEOLOGIA', icon: 'landmark', period: 'Siglo II', desc: 'Antigua capital maya famosa por poseer las estelas de piedra más altas descubiertas en Mesoamérica.', img: 'https://picsum.photos/seed/quirigua/800/500'
  },

  // ==========================================
  // EL SALVADOR (5 lugares)
  // ==========================================
  {
    id: 'joya_ceren', name: 'Joya de Cerén', country: 'SV', coords: [13.826, -89.356],
    category: 'ARQUEOLOGIA', icon: 'landmark', period: '600 d.C.', desc: 'Conocida como la "Pompeya de América", una aldea agrícola maya preservada intacta bajo ceniza volcánica.', img: 'https://picsum.photos/seed/joya_ceren/800/500'
  },
  {
    id: 'tazumal', name: 'Parque Arqueológico Tazumal', country: 'SV', coords: [13.979, -89.674],
    category: 'ARQUEOLOGIA', icon: 'landmark', period: '100 d.C.', desc: 'Importante asentamiento maya que cuenta con las pirámides más grandes descubiertas en El Salvador.', img: 'https://picsum.photos/seed/tazumal/800/500'
  },
  {
    id: 'teatro_sv', name: 'Teatro Nacional de San Salvador', country: 'SV', coords: [13.699, -89.191],
    category: 'ARTE', icon: 'music', period: '1917', desc: 'El teatro más antiguo de Centroamérica, joya del Renacimiento arquitectónico francés en El Salvador.', img: 'https://picsum.photos/seed/teatro_sv/800/500'
  },
  {
    id: 'marte_sv', name: 'Museo de Arte de El Salvador (MARTE)', country: 'SV', coords: [13.693, -89.241],
    category: 'ARTE', icon: 'palette', period: '2003', desc: 'Exhibe una extensa colección de arte salvadoreño desde mediados del siglo XIX hasta la época contemporánea.', img: 'https://picsum.photos/seed/marte_sv/800/500'
  },
  {
    id: 'palacio_nacional_sv', name: 'Palacio Nacional de El Salvador', country: 'SV', coords: [13.698, -89.192],
    category: 'PATRIMONIO', icon: 'building', period: '1911', desc: 'Edificio de gran belleza ecléctica que albergó los tres poderes del Estado salvadoreño.', img: 'https://picsum.photos/seed/palacio_nacional_sv/800/500'
  },

  // ==========================================
  // HONDURAS (5 lugares)
  // ==========================================
  {
    id: 'copan', name: 'Ruinas de Copán', country: 'HN', coords: [14.839, -89.143],
    category: 'ARQUEOLOGIA', icon: 'landmark', period: 'Siglo V', desc: 'El "París del mundo Maya", famoso por sus intrincadas esculturas de piedra y su impresionante escalinata de los jeroglíficos.', img: 'https://picsum.photos/seed/copan/800/500'
  },
  {
    id: 'fortaleza_omoa', name: 'Fortaleza de San Fernando de Omoa', country: 'HN', coords: [15.776, -88.040],
    category: 'PATRIMONIO', icon: 'building', period: '1773', desc: 'La estructura de defensa militar colonial española más grande de toda Centroamérica.', img: 'https://picsum.photos/seed/fortaleza_omoa/800/500'
  },
  {
    id: 'min_hn', name: 'Museo para la Identidad Nacional', country: 'HN', coords: [14.106, -87.204],
    category: 'ARTE', icon: 'palette', period: '2006', desc: 'Importante museo ubicado en el antiguo Palacio de los Ministerios en Tegucigalpa.', img: 'https://picsum.photos/seed/min_hn/800/500'
  },
  {
    id: 'catedral_comayagua', name: 'Catedral de Comayagua', country: 'HN', coords: [14.460, -87.637],
    category: 'PATRIMONIO', icon: 'building', period: '1711', desc: 'Joya barroca que alberga en su torre uno de los relojes de engranajes más antiguos del mundo.', img: 'https://picsum.photos/seed/catedral_comayagua/800/500'
  },
  {
    id: 'los_naranjos', name: 'Parque Arqueológico Los Naranjos', country: 'HN', coords: [14.954, -88.034],
    category: 'ARQUEOLOGIA', icon: 'landmark', period: '800 a.C.', desc: 'Importante sitio precolombino a orillas del Lago de Yojoa, punto de encuentro entre mayas y lencas.', img: 'https://picsum.photos/seed/los_naranjos/800/500'
  },

  // ==========================================
  // NICARAGUA (5 lugares)
  // ==========================================
  {
    id: 'leon_viejo', name: 'Ruinas de León Viejo', country: 'NI', coords: [12.399, -86.617],
    category: 'ARQUEOLOGIA', icon: 'landmark', period: '1524', desc: 'Restos de una de las primeras ciudades coloniales españolas en América, destruida por la actividad volcánica.', img: 'https://picsum.photos/seed/leon_viejo/800/500'
  },
  {
    id: 'catedral_leon', name: 'Catedral de León', country: 'NI', coords: [12.435, -86.879],
    category: 'PATRIMONIO', icon: 'building', period: '1747', desc: 'La catedral más grande de Centroamérica, famosa por su estilo barroco y por albergar los restos de Rubén Darío.', img: 'https://picsum.photos/seed/catedral_leon/800/500'
  },
  {
    id: 'teatro_ruben_dario', name: 'Teatro Nacional Rubén Darío', country: 'NI', coords: [12.155, -86.275],
    category: 'ARTE', icon: 'music', period: '1969', desc: 'Principal recinto de artes escénicas del país, sobreviviente del devastador terremoto de 1972.', img: 'https://picsum.photos/seed/teatro_ruben_dario/800/500'
  },
  {
    id: 'palacio_cultura_ni', name: 'Palacio Nacional de la Cultura', country: 'NI', coords: [12.156, -86.272],
    category: 'PATRIMONIO', icon: 'building', period: '1935', desc: 'Histórico edificio en Managua que alberga el Museo Nacional, el Archivo y la Biblioteca Nacional.', img: 'https://picsum.photos/seed/palacio_cultura_ni/800/500'
  },
  {
    id: 'fortaleza_inmaculada', name: 'El Castillo de la Inmaculada Concepción', country: 'NI', coords: [10.950, -84.398],
    category: 'PATRIMONIO', icon: 'landmark', period: '1675', desc: 'Fuerte español sobre el Río San Juan construido para detener los ataques piratas hacia el Lago de Nicaragua.', img: 'https://picsum.photos/seed/fortaleza_inmaculada/800/500'
  },

  // ==========================================
  // COSTA RICA (5 lugares)
  // ==========================================
  {
    id: 'teatro_nacional_cr', name: 'Teatro Nacional de Costa Rica', country: 'CR', coords: [9.933, -84.076],
    category: 'ARTE', icon: 'music', period: '1897', desc: 'Obra cumbre de la arquitectura josefina, símbolo del apogeo económico cafetalero del siglo XIX.', img: 'https://picsum.photos/seed/teatro_nacional_cr/800/500'
  },
  {
    id: 'guayabo', name: 'Monumento Nacional Guayabo', country: 'CR', coords: [9.972, -83.690],
    category: 'ARQUEOLOGIA', icon: 'landmark', period: '1000 a.C.', desc: 'El sitio arqueológico precolombino más importante del país, famoso por sus avanzados acueductos.', img: 'https://picsum.photos/seed/guayabo/800/500'
  },
  {
    id: 'museo_oro_cr', name: 'Museo del Oro Precolombino', country: 'CR', coords: [9.933, -84.077],
    category: 'ARQUEOLOGIA', icon: 'palette', period: '1950', 
    desc: 'Ubicado en una plaza subterránea, alberga miles de impresionantes piezas de oro de los indígenas costarricenses.', 
    img: 'https://picsum.photos/seed/museo_oro_cr/800/500'
  },
  {
    id: 'museo_nacional_cr', name: 'Museo Nacional de Costa Rica', country: 'CR', coords: [9.932, -84.071],
    category: 'PATRIMONIO', icon: 'building', period: '1887', desc: 'Ubicado en el Cuartel Bellavista, donde en 1948 se abolió oficialmente el ejército de Costa Rica.', img: 'https://picsum.photos/seed/museo_nacional_cr/800/500'
  },
  {
    id: 'museo_arte_cr', name: 'Museo de Arte Costarricense', country: 'CR', coords: [9.932, -84.095],
    category: 'ARTE', icon: 'palette', period: '1977', desc: 'Localizado en el edificio de la antigua terminal del aeropuerto internacional, preserva la mejor colección de artistas plásticos del país.', img: 'https://picsum.photos/seed/museo_arte_cr/800/500'
  },

  // ==========================================
  // PANAMÁ (5 lugares)
  // ==========================================
  {
    id: 'esclusas_miraflores', name: 'Esclusas de Miraflores (Canal de Panamá)', country: 'PA', coords: [8.996, -79.591],
    category: 'PATRIMONIO', icon: 'building', period: '1914', desc: 'Maravilla de la ingeniería moderna; centro de visitantes para observar el tránsito marítimo global.', img: 'https://media.istockphoto.com/id/1197557232/es/foto/vista-del-canal-de-panam%C3%A1-desde-crucero.jpg?s=612x612&w=0&k=20&c=au2F4Y4xlEqBMeih79-8XesXj29Aq6Y4hvN1Y7SZ-DY='
  },
  {
    id: 'casco_antiguo_pa', name: 'Casco Antiguo de Panamá', country: 'PA', coords: [8.952, -79.535],
    category: 'PATRIMONIO', icon: 'building', period: '1673', desc: 'Centro histórico vibrante fundado tras la destrucción de Panamá Viejo por piratas.', img: 'https://picsum.photos/seed/casco_antiguo_pa/800/500'
  },
  {
    id: 'panama_viejo', name: 'Panamá Viejo', country: 'PA', coords: [9.006, -79.485],
    category: 'ARQUEOLOGIA', icon: 'landmark', period: '1519', desc: 'Ruinas del primer asentamiento europeo en la costa pacífica de las Américas.', 
    img: 'https://picsum.photos/seed/panama_viejo/800/500'
  },
  {
    id: 'biomuseo', name: 'Biomuseo', country: 'PA', coords: [8.927, -79.544],
    category: 'ARTE', icon: 'palette', period: '2014', desc: 'Única obra de Frank Gehry en Latinoamérica, narra cómo el istmo de Panamá cambió la biodiversidad mundial.', img: 'https://picsum.photos/seed/biomuseo/800/500'
  },
  {
    id: 'museo_canal', name: 'Museo del Canal Interoceánico', country: 'PA', coords: [8.952, -79.535],
    category: 'HISTORICO', icon: 'building', period: '1997', desc: 'Documenta la titánica historia de la planificación y construcción del canal que unió dos océanos.', img: 'https://museodelcanal.com/wp-content/uploads/2023/03/Museo.jpg'
  },

  // ==========================================
  // CUBA (5 lugares)
  // ==========================================
  {
    id: 'capitolio_habana', name: 'Capitolio de la Habana', country: 'CU', coords: [23.136, -82.351],
    category: 'ARTE', icon: 'building', period: '1929', 
    desc: 'Abierto al público, es uno de los centros turísticos más visitados de la ciudad, habiéndose convertido en uno de los iconos arquitectónicos de La Habana,[4][5][6] y es considerado habitualmente el edificio más imponente de la ciudad.', 
    img: 'https://th.bing.com/th/id/R.ad0f0b8016e7cbc1c8e206d6ab388aa1?rik=H8e%2fpMYcIoQBoQ&pid=ImgRaw&r=0'
  },
  {
    id: 'castillo_morro', name: 'Castillo de los Tres Reyes del Morro', country: 'CU', coords: [23.150, -82.356],
    category: 'PATRIMONIO', icon: 'landmark', period: '1589', desc: 'Fortaleza icónica que resguarda la entrada a la Bahía de La Habana.', 
    img: 'https://tse3.mm.bing.net/th/id/OIP.xeTyYz7a1siV0E8o_6mJ2AHaFJ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    id: 'bellas_artes_cu', name: 'Museo Nacional de Bellas Artes', country: 'CU', coords: [23.139, -82.357],
    category: 'ARTE', icon: 'palette', period: '1913', 
    desc: 'Alberga la colección de arte cubano e internacional más importante de la isla.', 
    img: 'https://th.bing.com/th/id/R.f50bd60dd81b8002d6531973971db3de?rik=3cqTH7lIErtPqw&pid=ImgRaw&r=0'
  },
  {
    id: 'trinidad_cu', name: 'Trinidad', country: 'CU', coords: [21.802, -79.983],
    category: 'PATRIMONIO', icon: 'building', period: '1514', 
    desc: 'Una de las ciudades coloniales mejor conservadas del continente, congelada en la época dorada del azúcar.', 
    img: 'https://cdn.mediawpaccore.net/wp-content/uploads/2022/08/01034306/shutterstock_12870277661.jpg'
  },
  {
    id: 'valle_vinales', name: 'Valle de Viñales', country: 'CU', coords: [22.616, -83.714],
    category: 'PATRIMONIO', 
    icon: 'tree', period: 'Precolombino', 
    desc: 'Paisaje cultural excepcional con mogotes kársticos, fincas tradicionales de tabaco y arte rupestre local.', 
    img: 'https://tse4.mm.bing.net/th/id/OIP.Nsh3osUQONMNgg_oPXsMTgHaE6?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
  }, {
    id: 'zoologico_piedra', name: 'Zoológico de Piedra', country: 'CU', coords: [23.136, -82.351],
    category: 'ARTE', icon: 'building', period: '1977', 
    desc: 'Es todo un paraje selvático de gran valor que fue declarado Patrimonio de la Cultura Nacional el 26 de junio de 1985.', 
    img: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgzXpbD3fVx9JPqE-Nm5A86SNbs6E4U7Gym5bLSW5dmebGRkYPRBQSRmbFS6Uz3xher0W_Pe-1EUwoySwiDX1UQZw71Nqh9xk6bDILIHwpwi3Bx8XKoEvWpBsbytH-kGmQQJwHpBSqsKuH0/s1600/goc.jpg'
  },

  // ==========================================
  // REPÚBLICA DOMINICANA (5 lugares)
  // ==========================================
  {
    id: 'ciudad_colonial_do', name: 'Ciudad Colonial de Santo Domingo', country: 'DO', coords: [18.472, -69.883],
    category: 'PATRIMONIO', icon: 'building', period: '1498', desc: 'El núcleo urbano más antiguo fundado por europeos en América, sede de la primera catedral.', img: 'https://picsum.photos/seed/ciudad_colonial_do/800/500'
  },
  {
    id: 'alcazar_colon', name: 'Alcázar de Colón', country: 'DO', coords: [18.475, -69.882],
    category: 'PATRIMONIO', icon: 'building', period: '1514', desc: 'Residencia palaciega construida para Diego Colón, hijo del descubridor, con imponente estilo gótico mudéjar.', img: 'https://picsum.photos/seed/alcazar_colon/800/500'
  },
  {
    id: 'fortaleza_ozama', name: 'Fortaleza Ozama', country: 'DO', coords: [18.471, -69.881],
    category: 'PATRIMONIO', icon: 'landmark', period: '1502', desc: 'La construcción militar europea más antigua de las Américas.', img: 'https://picsum.photos/seed/fortaleza_ozama/800/500'
  },
  {
    id: 'faro_colon', name: 'Faro a Colón', country: 'DO', coords: [18.479, -69.868],
    category: 'PATRIMONIO', icon: 'building', period: '1992', desc: 'Monumento y museo colosal en forma de cruz donde descansan los presuntos restos de Cristóbal Colón.', img: 'https://picsum.photos/seed/faro_colon/800/500'
  },
  {
    id: 'museo_arte_moderno_do', name: 'Museo de Arte Moderno', country: 'DO', coords: [18.470, -69.914],
    category: 'ARTE', icon: 'palette', period: '1976', desc: 'Institución clave para la preservación y difusión de las artes plásticas dominicanas y del Caribe.', img: 'https://picsum.photos/seed/museo_arte_moderno_do/800/500'
  },

  // ==========================================
  // PUERTO RICO (5 lugares)
  // ==========================================
  {
    id: 'el_morro_pr', name: 'Castillo San Felipe del Morro', country: 'PR', coords: [18.471, -66.124],
    category: 'PATRIMONIO', icon: 'landmark', period: '1539', desc: 'Imponente ciudadela española que protegió la entrada a la Bahía de San Juan durante siglos.', img: 'https://picsum.photos/seed/el_morro_pr/800/500'
  },
  {
    id: 'viejo_san_juan', name: 'Viejo San Juan', country: 'PR', coords: [18.465, -66.116],
    category: 'PATRIMONIO', icon: 'building', period: '1521', desc: 'Distrito histórico famoso por sus calles adoquinadas, fachadas coloridas y animada vida cultural.', img: 'https://picsum.photos/seed/viejo_san_juan/800/500'
  },
  {
    id: 'castillo_san_cristobal', name: 'Castillo San Cristóbal', country: 'PR', coords: [18.467, -66.111],
    category: 'PATRIMONIO', icon: 'landmark', period: '1783', desc: 'La fortificación más grande construida por los españoles en el Nuevo Mundo.', img: 'https://picsum.photos/seed/castillo_san_cristobal/800/500'
  },
  {
    id: 'museo_arte_pr', name: 'Museo de Arte de Puerto Rico', country: 'PR', coords: [18.448, -66.066],
    category: 'ARTE', icon: 'palette', period: '2000', desc: 'Ubicado en un hermoso edificio neoclásico, exhibe el más amplio acervo del arte boricua.', img: 'https://picsum.photos/seed/museo_arte_pr/800/500'
  },
  {
    id: 'caguana', name: 'Centro Ceremonial Indígena de Caguana', country: 'PR', coords: [18.294, -66.778],
    category: 'ARQUEOLOGIA', icon: 'landmark', period: '1200 d.C.', desc: 'Uno de los yacimientos taínos más importantes del Caribe, con múltiples bateyes y petroglifos.', img: 'https://picsum.photos/seed/caguana/800/500'
  },

  // ==========================================
  // VENEZUELA (5 lugares)
  // ==========================================
  {
    id: 'ucv_ve', name: 'Ciudad Universitaria de Caracas', country: 'VE', coords: [10.488, -66.892],
    category: 'PATRIMONIO', icon: 'building', period: '1940', desc: 'Obra cumbre de Carlos Raúl Villanueva, magistral integración de arquitectura moderna y artes plásticas (Patrimonio Mundial).', img: 'https://picsum.photos/seed/ucv_ve/800/500'
  },
  {
    id: 'panteon_ve', name: 'Panteón Nacional', country: 'VE', coords: [10.511, -66.913],
    category: 'PATRIMONIO', icon: 'building', period: '1875', desc: 'Antigua iglesia reconvertida para albergar los restos mortales de Simón Bolívar y otros próceres.', img: 'https://picsum.photos/seed/panteon_ve/800/500'
  },
  {
    id: 'museo_bellas_artes_ve', name: 'Museo de Bellas Artes de Caracas', country: 'VE', coords: [10.500, -66.900],
    category: 'ARTE', icon: 'palette', period: '1917', desc: 'El museo de artes plásticas más antiguo de Venezuela, con importantes colecciones de arte egipcio, cerámico y moderno.', img: 'https://picsum.photos/seed/museo_bellas_artes_ve/800/500'
  },
  {
    id: 'coro_ve', name: 'Coro y su Puerto de La Vela', country: 'VE', coords: [11.403, -69.680],
    category: 'PATRIMONIO', icon: 'building', period: '1527', desc: 'Único ejemplo sobreviviente de fusión arquitectónica caribeña con estilos coloniales españoles y holandeses.', img: 'https://picsum.photos/seed/coro_ve/800/500'
  },
  {
    id: 'mukumbari', name: 'Sistema Teleférico Mukumbarí', country: 'VE', coords: [8.596, -71.144],
    category: 'PATRIMONIO', icon: 'tree', period: '1960', desc: 'El teleférico más alto y el segundo más largo del mundo, ascendiendo la cordillera de los Andes hasta el Pico Espejo.', img: 'https://picsum.photos/seed/mukumbari/800/500'
  },

  // ==========================================
  // COLOMBIA (5 lugares)
  // ==========================================
  {
    id: 'museo_oro_co', name: 'Museo del Oro', country: 'CO', coords: [4.601, -74.071],
    category: 'ARTE', icon: 'palette', period: '1939', 
    desc: 'Posee la colección de orfebrería prehispánica más grande e importante del mundo.', 
    img: 'https://th.bing.com/th/id/R.ea5ac36b58fb4f9e21e0e2b686076f3f?rik=5RK8T6M7X4qyfA&pid=ImgRaw&r=0'
  },
  {
    id: 'castillo_san_felipe_co', name: 'Castillo de San Felipe de Barajas', country: 'CO', coords: [10.422, -75.539],
    category: 'PATRIMONIO', icon: 'landmark', period: '1657', 
    desc: 'El complejo militar español más formidable construido en el continente americano, en Cartagena de Indias.', 
    img: 'https://th.bing.com/th/id/R.c055f6bcacc13939ffac37f2d30a0bbb?rik=AFkQ1FPMIsk4SA&pid=ImgRaw&r=0'
  },
  {
    id: 'ciudad_perdida', name: 'Ciudad Perdida (Teyuna)', country: 'CO', coords: [11.037, -73.925],
    category: 'ARQUEOLOGIA', 
    icon: 'landmark', period: '800 d.C.', 
    desc: 'Mítico asentamiento de los indígenas Tayrona escondido profundamente en la espesura de la Sierra Nevada de Santa Marta.', 
    img: 'https://th.bing.com/th/id/R.c36637f4e476901a994670f6f2e121a3?rik=6fWHGzY2P9wD5w&pid=ImgRaw&r=0'
  },
  {
    id: 'santuario_lajas', name: 'Santuario de Las Lajas', country: 'CO', coords: [0.805, -77.585],
    category: 'PATRIMONIO', icon: 'building', period: '1916',
    desc: 'Deslumbrante iglesia neogótica construida sobre un puente que cruza el abismo del cañón del río Guáitara.', 
    img: 'https://www.renunciamosyviajamos.com/wp-content/uploads/2016/12/Santuario-de-las-lajas-Colombia-Renunciamos-y-viajamos-13.jpg'
  },
  {
    id: 'museo_botero', name: 'Museo Botero', country: 'CO', coords: [4.596, -74.073],
    category: 'ARTE', icon: 'palette', period: '2000', 
    desc: 'Hospeda las icónicas obras voluptuosas de Fernando Botero, así como su colección privada de impresionismo europeo.', 
    img: 'https://tse3.mm.bing.net/th/id/OIP.jIvB-I9avLbocd7MvK5C1QHaE6?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
  },

  // ==========================================
  // ECUADOR (5 lugares)
  // ==========================================
  {
    id: 'quito_historico', name: 'Centro Histórico de Quito', country: 'EC', coords: [-0.220, -78.512],
    category: 'PATRIMONIO', icon: 'building', period: '1534', desc: 'El conjunto histórico colonial mejor conservado de América, el primero en ser declarado Patrimonio de la Humanidad.', img: 'https://picsum.photos/seed/quito_historico/800/500'
  },
  {
    id: 'mitad_mundo', name: 'Ciudad Mitad del Mundo', country: 'EC', coords: [-0.002, -78.445],
    category: 'PATRIMONIO', icon: 'landmark', period: '1979', desc: 'Monumento emblemático que marca el paso de la línea ecuatorial que divide los hemisferios del planeta.', img: 'https://picsum.photos/seed/mitad_mundo/800/500'
  },
  {
    id: 'ingapirca', name: 'Complejo Arqueológico Ingapirca', country: 'EC', coords: [-2.544, -78.877],
    category: 'ARQUEOLOGIA', icon: 'landmark', period: 'Siglo XV', desc: 'Las ruinas incas más importantes y masivas del Ecuador, destacando el Templo del Sol de piedra pulida.', img: 'https://picsum.photos/seed/ingapirca/800/500'
  },
  {
    id: 'capilla_hombre', name: 'La Capilla del Hombre', country: 'EC', coords: [-0.176, -78.473],
    category: 'ARTE', icon: 'palette', period: '2002', desc: 'Un tributo arquitectónico monumental al dolor, la ira y la resiliencia del ser humano, concebido por el pintor Oswaldo Guayasamín.', img: 'https://picsum.photos/seed/capilla_hombre/800/500'
  },
  {
    id: 'cuenca_historico', name: 'Centro Histórico de Santa Ana de los Ríos de Cuenca', country: 'EC', coords: [-2.897, -79.004],
    category: 'PATRIMONIO', icon: 'building', period: '1557', desc: 'Famosa por sus cúpulas, sus calles empedradas y su fuerte herencia intelectual y artesanal.', img: 'https://picsum.photos/seed/cuenca_historico/800/500'
  },

  // ==========================================
  // BOLIVIA (5 lugares)
  // ==========================================
  {
    id: 'tiwanaku', name: 'Centro Espiritual y Político de la Cultura Tiwanaku', country: 'BO', coords: [-16.555, -68.673],
    category: 'ARQUEOLOGIA', icon: 'landmark', period: '1500 a.C.', desc: 'Restos monumentales de una de las civilizaciones precursoras del Imperio Inca más importantes y longevas de los Andes.', img: 'https://picsum.photos/seed/tiwanaku/800/500'
  },
  {
    id: 'casa_libertad_bo', name: 'Casa de la Libertad (Sucre)', country: 'BO', coords: [-19.048, -65.259],
    category: 'PATRIMONIO', icon: 'building', period: '1621', desc: 'El recinto más sagrado de la patria boliviana; lugar donde se firmó la Declaración de la Independencia.', img: 'https://picsum.photos/seed/casa_libertad_bo/800/500'
  },
  {
    id: 'casa_moneda_bo', name: 'Casa Nacional de Moneda (Potosí)', country: 'BO', coords: [-19.588, -65.753],
    category: 'HISTORICO', icon: 'building', period: '1759', desc: 'Edificio colonial inmenso que acuñaba la plata extraída del Cerro Rico que financiaba el Imperio Español.', img: 'https://picsum.photos/seed/casa_moneda_bo/800/500'
  },
  {
    id: 'fuerte_samaipata', name: 'El Fuerte de Samaipata', country: 'BO', coords: [-18.175, -63.821],
    category: 'ARQUEOLOGIA', icon: 'landmark', period: '300 d.C.', desc: 'Enorme roca esculpida con figuras geométricas y animales, centro ceremonial preincaico en las estribaciones andinas.', img: 'https://picsum.photos/seed/fuerte_samaipata/800/500'
  },
  {
    id: 'museo_arte_bo', name: 'Museo Nacional de Arte (La Paz)', country: 'BO', coords: [-16.495, -68.133],
    category: 'ARTE', icon: 'palette', period: '1960', desc: 'Hospedado en un magnífico palacio de piedra tallada de estilo barroco mestizo en pleno centro paceño.', img: 'https://picsum.photos/seed/museo_arte_bo/800/500'
  },

  // ==========================================
  // PARAGUAY (5 lugares)
  // ==========================================
  {
    id: 'mision_trinidad', name: 'Misiones Jesuíticas de la Santísima Trinidad', country: 'PY', coords: [-27.131, -55.702],
    category: 'PATRIMONIO', icon: 'building', period: '1706', desc: 'Las ruinas más extensas y mejor conservadas de las famosas reducciones jesuíticas para la evangelización guaraní.', img: 'https://picsum.photos/seed/mision_trinidad/800/500'
  },
  {
    id: 'panteon_heroes_py', name: 'Panteón Nacional de los Héroes', country: 'PY', coords: [-25.281, -57.635],
    category: 'PATRIMONIO', icon: 'building', period: '1936', desc: 'Joya arquitectónica de Asunción y mausoleo sagrado donde reposan los grandes próceres de la historia paraguaya.', img: 'https://picsum.photos/seed/panteon_heroes_py/800/500'
  },
  {
    id: 'museo_barro', name: 'Museo del Barro', country: 'PY', coords: [-25.279, -57.564],
    category: 'ARTE', icon: 'palette', period: '1979', desc: 'Imprescindible institución que exhibe arte indígena, popular y contemporáneo del Paraguay en un plano de igualdad.', img: 'https://picsum.photos/seed/museo_barro/800/500'
  },
  {
    id: 'palacio_lopez', name: 'Palacio de los López', country: 'PY', coords: [-25.277, -57.638],
    category: 'PATRIMONIO', icon: 'building', period: '1857', desc: 'Espléndido palacio de corte neoclásico y renacentista, actual sede del gobierno de la República del Paraguay.', img: 'https://picsum.photos/seed/palacio_lopez/800/500'
  },
  {
    id: 'mision_jesus', name: 'Misión Jesuítica de Jesús de Tavarangue', country: 'PY', coords: [-27.055, -55.751],
    category: 'PATRIMONIO', icon: 'building', period: '1685', desc: 'Conocida por su iglesia inconclusa que presenta arcos lobulados de estilo morisco, únicos en la región.', img: 'https://picsum.photos/seed/mision_jesus/800/500'
  },

  // ==========================================
  // URUGUAY (5 lugares)
  // ==========================================
  {
    id: 'casapueblo', name: 'Casapueblo', country: 'UY', coords: [-34.908, -55.045],
    category: 'ARTE', icon: 'building', period: '1960', desc: 'Iconoclasta edificación escultórica blanca frente al mar creada por el artista uruguayo Carlos Páez Vilaró.', img: 'https://picsum.photos/seed/casapueblo/800/500'
  },
  {
    id: 'teatro_solis', name: 'Teatro Solís', country: 'UY', coords: [-34.907, -56.201],
    category: 'ARTE', icon: 'music', period: '1856', desc: 'El teatro principal del país y uno de los más importantes y antiguos escenarios líricos de Sudamérica.', img: 'https://picsum.photos/seed/teatro_solis/800/500'
  },
  {
    id: 'colonia_sacramento', name: 'Barrio Histórico de Colonia del Sacramento', country: 'UY', coords: [-34.471, -57.851],
    category: 'PATRIMONIO', icon: 'building', period: '1680', desc: 'Fusión singular de trazados urbanos portugueses y españoles que ha sobrevivido intacta en la orilla del Río de la Plata.', img: 'https://picsum.photos/seed/colonia_sacramento/800/500'
  },
  {
    id: 'palacio_salvo', name: 'Palacio Salvo', country: 'UY', coords: [-34.906, -56.198],
    category: 'PATRIMONIO', icon: 'building', period: '1928', desc: 'Emblemático rascacielos ecléctico en la Plaza Independencia de Montevideo, gemelo conceptual del Palacio Barolo porteño.', img: 'https://picsum.photos/seed/palacio_salvo/800/500'
  },
  {
    id: 'mnav_uy', name: 'Museo Nacional de Artes Visuales (MNAV)', country: 'UY', coords: [-34.913, -56.164],
    category: 'ARTE', icon: 'palette', period: '1911', desc: 'Custodia la mayor e imperdible colección de arte uruguayo, con piezas de Blanes, Figari y Torres García.', img: 'https://picsum.photos/seed/mnav_uy/800/500'
  },

  // ==========================================
  // CHILE (5 lugares)
  // ==========================================
  {
    id: 'rapa_nui', name: 'Parque Nacional Rapa Nui (Isla de Pascua)', country: 'CL', coords: [-27.112, -109.349],
    category: 'ARQUEOLOGIA', icon: 'landmark', period: '1200 d.C.', desc: 'Aislada isla polinésica mundialmente famosa por sus misteriosas y colosales estatuas talladas en roca (los moáis).', img: 'https://picsum.photos/seed/rapa_nui/800/500'
  },
  {
    id: 'museo_precolombino_cl', name: 'Museo Chileno de Arte Precolombino', country: 'CL', coords: [-33.438, -70.653],
    category: 'ARTE', icon: 'palette', period: '1981', desc: 'Reconocido internacionalmente por la calidad de su exhibición del legado artístico de los pueblos originarios de América.', img: 'https://picsum.photos/seed/museo_precolombino_cl/800/500'
  },
  {
    id: 'iglesias_chiloe', name: 'Iglesias de Chiloé', country: 'CL', coords: [-42.482, -73.764],
    category: 'PATRIMONIO', icon: 'building', period: 'Siglos XVIII', desc: 'Excepcional conjunto de iglesias de madera nativa que nacieron de la interacción jesuita con los constructores de botes locales.', img: 'https://picsum.photos/seed/iglesias_chiloe/800/500'
  },
  {
    id: 'palacio_moneda', name: 'Palacio de La Moneda', country: 'CL', coords: [-33.442, -70.653],
    category: 'PATRIMONIO', icon: 'building', period: '1805', desc: 'Testigo mudo y eje de la historia contemporánea chilena; monumental edificio neoclásico sede de la presidencia.', img: 'https://picsum.photos/seed/palacio_moneda/800/500'
  },
  {
    id: 'salitreras', name: 'Oficinas Salitreras Humberstone y Santa Laura', country: 'CL', coords: [-20.208, -69.795],
    category: 'PATRIMONIO', icon: 'building', period: '1872', desc: 'Sitio de memoria industrial en el crudo desierto de Atacama, vestigio de la "cultura pampina" y la era del oro blanco.', img: 'https://picsum.photos/seed/salitreras/800/500'
  }
];