import Image from "next/image";
import "./histoire.css";

export default function HistoirePage() {
  return (
    <article className="histoire">
      <div className="container histoire-container">
        <header className="histoire-header">
          <p className="histoire-kicker">Patrimoine du XX<sup>e</sup> siècle</p>
          <h1>La Tour de la Résidence du Pharo&nbsp;: sentinelle contestée du Vieux Port</h1>
          <p className="histoire-subtitle">
            Cinquante-cinq mètres de béton, de verre et de controverse sur le plus beau bassin de Marseille
          </p>
        </header>

        <div className="histoire-hero-image">
          <Image
            src="/archi.webp"
            alt="La Résidence du Pharo, façade avant"
            width={800}
            height={498}
            className="histoire-img"
            priority
          />
        </div>

        <div className="histoire-body">
          <p>
            Au 75, boulevard Charles Livon, dans le 7<sup>e</sup> arrondissement de Marseille, une tour de dix-neuf étages se dresse face au mistral et aux regards. Depuis 1956, ses cinquante-cinq mètres de hauteur et ses cent-cinq logements dominent le quartier du Pharo, le Vieux Port et, par temps clair, l&apos;archipel du Frioul. Classée Patrimoine du XX<sup>e</sup> siècle, objet d&apos;admiration pour ses résidents et de franche hostilité pour une partie des Marseillais, la Résidence du Pharo condense en un seul ouvrage toutes les tensions de l&apos;urbanisme d&apos;après-guerre&nbsp;: la reconstruction, la modernité verticale, la dérogation réglementaire, et l&apos;éternelle question de ce qu&apos;il est permis de bâtir face à la mer.
          </p>
          <p>
            Son histoire est indissociable de celle de la reconstruction de Marseille, de l&apos;ambition de Fernand Pouillon, de la méfiance de Gaston Defferre, et du savoir-faire de deux architectes aujourd&apos;hui presque oubliés, Yvon Bentz et André Devin.
          </p>

          <h2>Marseille, 1949&nbsp;: reconstruire, densifier, s&apos;élever</h2>
          <p>
            La Seconde Guerre mondiale a laissé Marseille profondément meurtrie. Les dynamitages ordonnés par l&apos;occupant allemand en février 1943 ont anéanti une partie du quartier nord du Vieux Port. Les bombardements alliés de 1944 ont frappé les quartiers sud, notamment le Pharo. En 1949, un Plan d&apos;Urbanisme coproduit par l&apos;État et la Ville pose les bases d&apos;un renouveau. Parmi ses dispositions les plus audacieuses&nbsp;: les règles de reconstruction autorisent le dépassement des plafonds de hauteur courante pour les immeubles implantés sur des sites détruits pendant la guerre. Pour les terrains industriels désaffectés, la dérogation est encore plus généreuse&nbsp;: aucun plafond de hauteur ne s&apos;applique.
          </p>
          <p>
            Le quartier du Pharo, entre la plage des Catalans et le Fort Saint-Nicolas, surplombant l&apos;entrée du Vieux Port, se voit attribuer une vocation de quartier de buildings. En 1952, Fernand Pouillon, figure tutélaire de la reconstruction marseillaise, propose un plan d&apos;urbanisme de détail prévoyant un regroupement de tours sur la presqu&apos;île. Pouillon engage des discussions avec l&apos;armée, qui possède une part importante du foncier, pour monter un projet grandiose d&apos;urbanisation de presque tout le secteur.
          </p>
          <p>
            Le projet ne verra jamais le jour sous cette forme. L&apos;inimitié croissante entre Pouillon et Gaston Defferre, élu maire en 1953, y met un terme. Le profil de René Egger, plus docile et institutionnel, correspond davantage au tempérament du nouveau maire et à ses ambitions de bâtisseur. Defferre et Egger formeront ce que les chroniqueurs de l&apos;époque qualifient de «&nbsp;couple de bâtisseurs&nbsp;», laissant à d&apos;autres architectes le soin de réaliser, au cas par cas, les tours que Pouillon avait imaginées en réseau.
          </p>
          <p>
            C&apos;est dans ce contexte que surgit la Résidence du Pharo.
          </p>

          <h2>Bentz et Devin&nbsp;: un tandem discret mais prolifique</h2>
          <p>
            Les architectes de la tour ne sont pas des inconnus, mais leur nom n&apos;a jamais atteint la notoriété d&apos;un Pouillon, d&apos;un Egger ou d&apos;un Le Corbusier. André Devin, né en 1920, est un élève de l&apos;atelier Bigot. Il obtient son diplôme en 1928 et travaille dans les années trente à Marseille avec Eugène Chirié, figure locale de l&apos;Art Déco. Yvon Bentz, quant à lui, s&apos;est fait remarquer par sa participation au concours pour l&apos;escalier monumental de la gare Saint-Charles, finalement remporté par Sénès.
          </p>
          <p>
            Les deux hommes interviennent d&apos;abord séparément dans la reconstruction des quartiers démolis de l&apos;Hôtel de Ville, sur la rive nord du port. C&apos;est après la guerre qu&apos;ils s&apos;associent pour une production commune axée sur le logement collectif. Leur première réalisation notable en tandem est Sulfur City, achevée en 1954 au 88, cours Gouffé, dans le 5<sup>e</sup> arrondissement. Cet ensemble de cent quatorze logements, érigé sur l&apos;emplacement d&apos;une ancienne usine de soufre, leur permet d&apos;expérimenter un procédé qui deviendra leur signature&nbsp;: une fine structure réticulée en béton, une résille, qui enveloppe les façades et unifie visuellement des bâtiments de gabarits différents (une tour de dix-sept niveaux et deux barres horizontales de duplex). Sulfur City reçoit le label Patrimoine du XX<sup>e</sup> siècle en 2000.
          </p>
          <p>
            La Résidence du Pharo est le prolongement direct de cette expérience. Elle en reprend les principes, en les portant à une échelle supérieure et sur un site incomparablement plus exposé.
          </p>

          <h2>1955&nbsp;: le permis de construire d&apos;une borne sur le bassin</h2>
          <p>
            Le permis de construire est déposé en 1955. Le maître d&apos;ouvrage est la SCI d&apos;Entraide Professionnelle Finances. L&apos;entreprise de construction est celle de Georges Laville, le même constructeur qui avait réalisé Sulfur City. Le bureau d&apos;études techniques est celui de Laupiès.
          </p>
          <p>
            Le programme est ambitieux pour un terrain somme toute modeste&nbsp;: cent-cinq logements répartis dans un ensemble de trois bâtiments, des garages, et des commerces. Les trois corps du bâtiment dessinent une composition en plan qui organise une avant-cour ouverte sur le boulevard Pasteur, de telle sorte que la tour soit visible sur toute sa hauteur depuis la voie publique. Le centre de cette cour est occupé par une station service, signe de la modernité automobile des années cinquante, qui précède l&apos;accès aux garages.
          </p>
          <p>
            La tour proprement dite adopte un plan en H et distribue six appartements par étage. Ses dix-neuf niveaux culminent à cinquante-cinq mètres. Au sud, un immeuble de huit étages forme un angle, une équerre, desservi par trois cages d&apos;escalier. Entre ces deux volumes, un bâtiment bas d&apos;un étage fait office de garage et assure la liaison. Le profil urbain dessine un décroché volontaire qui crée une trouée en direction du Fort Saint-Nicolas. Cette percée visuelle, en fond de perspective de la rue Charras, amène la lumière de l&apos;est sur le boulevard Pasteur et achève de détacher la tour des alignements continus sur l&apos;espace public.
          </p>
          <p>
            Les travaux sont achevés en 1956.
          </p>

          <h2>La résille&nbsp;: l&apos;enveloppe qui fabrique l&apos;élégance</h2>
          <p>
            Le plan en H de la tour pose un problème que les architectes identifient d&apos;emblée&nbsp;: l&apos;édifice, relativement trapu pour sa hauteur, manque d&apos;élancement. La solution qu&apos;ils apportent est leur trouvaille la plus aboutie. Ils enveloppent la tour d&apos;une résille de béton dont la maille fait tantôt corps avec l&apos;immeuble, tantôt s&apos;en détache de manière aérienne. Ce procédé de réglage de surface, proche du mur-rideau, avait déjà été mis en œuvre par Bentz et Devin à Sulfur City. Il prend ici un statut nouveau&nbsp;: celui d&apos;une enveloppe architecturale dotée d&apos;une certaine indépendance vis-à-vis du volume propre de la tour.
          </p>
          <p>
            La grille est travaillée par une série de balcons saillants répartis de manière irrégulière sur les façades. Les variations dans la distribution des fenêtres évitent tout effet de système monotone sur la paroi. L&apos;architecte et historien T. Durousseau, dans sa notice monographique rédigée pour le Ministère de la Culture, rapproche ce traitement de la trame du projet de tour pour le concours du Chicago Tribune dessiné en 1922 par Walter Gropius. Le parallèle est éclairant&nbsp;: chez Gropius, les altérations de la trame régulière servent à créer un dynamisme visuel sans renoncer à la rigueur structurelle. Chez Bentz et Devin, le même principe est au service d&apos;une grille dont la maille reste relativement fine (une hauteur d&apos;étage, une largeur de fenêtre), mais dont les perturbations aléatoires empêchent l&apos;œil de la réduire à un simple quadrillage.
          </p>
          <p>
            Pour renforcer l&apos;effet de mur-rideau, les remplissages des garde-corps sont en verre armé semi-transparent. Les allèges des fenêtres sont réalisées en produits verriers émaillés vert céladon, conférant à la paroi une brillance caractéristique qui varie avec la lumière du jour et le reflet de la mer. Les superstructures de toiture sont soigneusement profilées&nbsp;: un étage en retrait se prolonge par un second qui intègre les émergences techniques de l&apos;immeuble, évitant l&apos;écueil de la machinerie exposée.
          </p>
          <p>
            L&apos;immeuble bas au sud reprend la même grille de béton et les mêmes éléments vitrés que la tour, assurant la cohérence visuelle de l&apos;ensemble. La galerie commerciale, de double hauteur, donne au soubassement un registre colossal qui ancre la composition dans le sol.
          </p>

          <h2>Defferre, la défiance, et l&apos;anecdote du panorama trompeur</h2>
          <p>
            La tradition orale marseillaise rapporte une anecdote qui en dit long sur les rapports entre pouvoir politique et production architecturale dans la ville des années cinquante. Le maire Gaston Defferre, nous dit-on, aurait nourri une certaine défiance à l&apos;égard des architectes de la tour, qui l&apos;avaient pourtant assuré du faible impact visuel de l&apos;immeuble sur le bassin du Vieux Port. La légende veut qu&apos;il ait regretté longtemps de s&apos;être laissé convaincre.
          </p>
          <p>
            Il est vrai que la tour, une fois achevée, s&apos;impose comme une borne sur le panorama portuaire, une présence que rien dans le gabarit traditionnel du quartier ne laissait présager. Elle fait écho, de l&apos;autre côté de l&apos;entrée du port, à la résidence de La Tourette dessinée par Pouillon, créant un dialogue de verticales qui encadre le bassin.
          </p>
          <p>
            L&apos;ironie historique est double. D&apos;une part, c&apos;est le plan de Pouillon lui-même, celui dont Defferre avait écarté l&apos;auteur, qui avait ouvert la voie réglementaire aux tours du Pharo. D&apos;autre part, la tour de Bentz et Devin est la seule survivante de ce plan avorté&nbsp;: elle devait être accompagnée de plusieurs autres tours, formant un ensemble cohérent. Restée seule, elle apparaît comme un fragment de ville verticale qui n&apos;a jamais existé, ce qui accentue son caractère d&apos;anomalie dans le paysage.
          </p>

          <h2>Un bâtiment que l&apos;on rêve de démolir et que l&apos;on finit par classer</h2>
          <p>
            La Résidence du Pharo a longtemps été l&apos;objet d&apos;un rejet populaire qui ne s&apos;est jamais totalement dissipé. Beaucoup de Marseillais considèrent que la tour dénature le panorama du Vieux Port, qu&apos;elle écrase le Fort Saint-Nicolas, qu&apos;elle n&apos;aurait jamais dû s&apos;élever là. L&apos;hostilité est d&apos;autant plus vive qu&apos;une autre barre d&apos;immeubles, La Grande Corniche construite en 1964 par d&apos;autres architectes au-dessus du Vallon des Auffes, est venue aggraver le sentiment d&apos;une agression moderniste systématique contre les sites les plus emblématiques du littoral marseillais.
          </p>
          <p>
            Pourtant, le regard a changé. La Direction Régionale des Affaires Culturelles de Provence-Alpes-Côte d&apos;Azur a intégré la Résidence du Pharo dans son étude des ensembles et résidences de la période 1955 à 1975, sous la référence 0707 de son répertoire du patrimoine domestique. Le label Patrimoine du XX<sup>e</sup> siècle, devenu depuis Architecture Contemporaine Remarquable, lui a été attribué. La notice monographique rédigée par T. Durousseau reconnaît la qualité de la composition urbaine, l&apos;intelligence du traitement de la résille, et la réussite de la galerie commerciale comme «&nbsp;événement urbain&nbsp;».
          </p>
          <p>
            De l&apos;intérieur, les résidents ne tarissent pas d&apos;éloges. Un ancien habitant, répondant sur les réseaux sociaux à une photographie de la tour, résume le paradoxe d&apos;une formule qui vaut bien un rapport d&apos;expertise&nbsp;: laid à l&apos;extérieur, extraordinaire à l&apos;intérieur, avec la plus belle vue de Marseille.
          </p>

          <h2>Bentz et Devin après le Pharo</h2>
          <p>
            L&apos;association entre Yvon Bentz et André Devin ne s&apos;arrête pas au Pharo. En 1973, ils réalisent Le Riviera, un immeuble de cent-un logements dans le 5<sup>e</sup> arrondissement. On doit aussi au tandem l&apos;immeuble Les Catalans, aux façades blanches plissées, dans le même quartier du Pharo. Leur œuvre commune, sans être immense, illustre une ligne architecturale cohérente&nbsp;: la résille de béton comme signature, le traitement chromatique des vitrages, l&apos;intégration de commerces en pied d&apos;immeuble, et une attention au profil urbain qui dépasse le seul objet architectural pour penser le rapport à la rue, au parvis, à la percée visuelle.
          </p>
          <p>
            André Devin meurt en 1983. Leur production est aujourd&apos;hui étudiée par la DRAC dans le cadre de l&apos;inventaire systématique du patrimoine du XX<sup>e</sup> siècle en région PACA, ce qui constitue une forme tardive mais réelle de reconnaissance institutionnelle.
          </p>

          <h2>Ce que la tour dit de Marseille</h2>
          <p>
            La Tour du Pharo n&apos;est ni un chef-d&apos;œuvre unanimement célébré, ni une erreur purement regrettable. Elle est, plus justement, un document. Un document qui raconte la reconstruction d&apos;une ville blessée, les ambitions contradictoires de ses élus, la capacité d&apos;invention de ses architectes, et l&apos;impossibilité de toucher au paysage du Vieux Port sans provoquer un débat qui traverse les décennies.
          </p>
          <p>
            Elle raconte aussi la solitude d&apos;un bâtiment conçu pour ne pas être seul. Si le plan de Pouillon avait été réalisé en entier, la tour aurait pris place dans une composition de verticales, un quartier de buildings au sens propre. Elle serait un élément parmi d&apos;autres. L&apos;abandon progressif de ce plan a laissé la Résidence du Pharo comme un fragment, une pièce d&apos;un puzzle dont les autres pièces n&apos;ont jamais été posées.
          </p>
          <p>
            Et c&apos;est peut-être cette solitude qui fait sa force. Vue depuis la mer, depuis Notre-Dame de la Garde, ou depuis la Corniche, la tour fonctionne comme un repère, un signal vertical qui marque l&apos;entrée sud du port. Sa résille de béton capte la lumière provençale avec une subtilité que les photographies peinent à restituer. Ses allèges vert céladon dialoguent avec la couleur de l&apos;eau selon l&apos;heure du jour.
          </p>
          <p>
            Soixante-dix ans après sa construction, la Tour de la Résidence du Pharo est toujours là. On ne la démolira pas. On ne l&apos;aimera peut-être jamais tout à fait. Mais on a fini par la classer. À Marseille, c&apos;est parfois ainsi que les histoires d&apos;architecture se résolvent&nbsp;: non par la réconciliation, mais par la coexistence.
          </p>

          <aside className="histoire-sources">
            <h3>Sources</h3>
            <p>
              Notice monographique de T. Durousseau pour le Ministère de la Culture (DRAC PACA, référence 0707), fiche Tourisme Marseille.com par Dominique Milherou, brochure CAUE sur le Vieux Port, base Emporis, notices du label Architecture Contemporaine Remarquable (Ministère de la Culture).
            </p>
          </aside>
        </div>
      </div>
    </article>
  );
}
