import { useState, useEffect } from 'react';
import { ArrowRight, Users, TrendingUp, CheckCircle, Award, Zap, Shield, Target, BarChart3, Calendar, Globe, ChevronDown, ChevronUp, Star, FileText, Play } from 'lucide-react';
import SEOManager from './components/SEOManager';
import SEOPageViewer from './components/SEOPageViewer';
import Header from './components/Header';
import Footer from './components/Footer';
import { supabase, SEOMetadata } from './lib/supabase';

function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<'landing' | 'seo' | 'seo-page'>('landing');
  const [seoPage, setSeoPage] = useState<SEOMetadata | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  useEffect(() => {
    const path = window.location.pathname;

    if (path && path !== '/') {
      const slug = path.replace(/^\//, '');
      loadSEOPage(slug);
    }
  }, []);

  const loadSEOPage = async (pageKey: string) => {
    setIsLoadingPage(true);
    try {
      const { data, error } = await supabase
        .from('seo_metadata')
        .select('*')
        .eq('page_key', pageKey)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSeoPage(data);
        setCurrentPage('seo-page');
      }
    } catch (error) {
      console.error('Error loading SEO page:', error);
    } finally {
      setIsLoadingPage(false);
    }
  };

  if (isLoadingPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement de la page...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'seo-page' && seoPage) {
    return (
      <SEOPageViewer
        page={seoPage}
        onEdit={() => {
          setCurrentPage('seo');
        }}
        onBack={() => {
          setSeoPage(null);
          setCurrentPage('landing');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  if (currentPage === 'seo') {
    return (
      <>
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">NetworkPro</span>
              </div>
              <button
                onClick={() => setCurrentPage('landing')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Retour au site
              </button>
            </div>
          </div>
        </nav>
        <div className="pt-20">
          <SEOManager />
        </div>
      </>
    );
  }

  const faqs = [
    {
      q: "Comment l'application gestion de cartes de visites sécurise-t-elle mes données ?",
      a: "Vos informations sont cryptées et stockées sur des serveurs sécurisés, garantissant une confidentialité totale de votre réseau."
    },
    {
      q: "Peut-on exporter les contacts de l'application gestion de cartes de visites ?",
      a: "Oui, vous pouvez exporter vos bases de données vers les formats standards pour une intégration CRM."
    },
    {
      q: "L'application gestion de cartes de visites fonctionne-t-elle hors ligne ?",
      a: "L'ajout de contacts est possible sans connexion, la synchronisation se fait dès que vous retrouvez du réseau."
    },
    {
      q: "Quelles devises sont supportées dans l'application gestion de cartes de visites ?",
      a: "L'application supporte l'Euro, le Dollar et les principales devises internationales pour vos offres globales."
    },
    {
      q: "L'application gestion de cartes de visites est-elle compatible avec LinkedIn ?",
      a: "Vous pouvez ajouter directement les liens des profils LinkedIn pour un accès rapide aux carrières de vos contacts."
    },
    {
      q: "Comment l'application gestion de cartes de visites aide-t-elle à la relance ?",
      a: "Un système de notifications personnalisables vous rappelle de recontacter vos prospects selon la périodicité que vous avez définie."
    },
    {
      q: "Peut-on scanner plusieurs cartes à la fois dans l'application gestion de cartes de visites ?",
      a: "Le scan est optimisé pour une capture rapide et successive, permettant de traiter des dizaines de cartes en minutes."
    },
    {
      q: "L'application gestion de cartes de visites convient-elle aux TPE ?",
      a: "Absolument, elle est conçue pour offrir la puissance d'un CRM aux structures légères et agiles."
    },
    {
      q: "Peut-on catégoriser les contacts dans l'application gestion de cartes de visites ?",
      a: "Oui, via des statuts prédéfinis comme Lead, Prospect, Client ou Partenaire pour une segmentation efficace."
    },
    {
      q: "L'application gestion de cartes de visites propose-t-elle un mode gratuit ?",
      a: "Oui, les fonctionnalités de base sont accessibles pour vous permettre de tester l'efficacité de notre méthode immédiatement."
    },
    {
      q: "Comment ajouter une offre dans l'application gestion de cartes de visites ?",
      a: "Il suffit de se rendre sur la fiche d'un contact et de cliquer sur \"Ajouter une offre\"."
    },
    {
      q: "L'application gestion de cartes de visites gère-t-elle les numéros internationaux ?",
      a: "Oui, le sélecteur de pays automatique assure le formatage correct de tous vos numéros de téléphone mondiaux."
    },
    {
      q: "Peut-on mettre une photo du contact dans l'application gestion de cartes de visites ?",
      a: "C'est même conseillé pour favoriser la reconnaissance visuelle lors de vos futurs échanges professionnels."
    },
    {
      q: "L'application gestion de cartes de visites est-elle disponible sur Android et iOS ?",
      a: "Notre solution est une application web mobile optimisée pour tous les types de smartphones récents."
    },
    {
      q: "Comment supprimer un contact dans l'application gestion de cartes de visites ?",
      a: "La gestion est simplifiée, vous pouvez archiver ou supprimer n'importe quelle fiche en deux clics seulement."
    },
    {
      q: "L'application gestion de cartes de visites aide-t-elle pour le RGPD ?",
      a: "L'outil vous permet de noter le consentement de vos contacts, facilitant votre mise en conformité réglementaire."
    },
    {
      q: "Quel est le bénéfice principal de l'application gestion de cartes de visites ?",
      a: "La transformation radicale de votre réseau passif en un pipeline de vente actif et mesurable."
    },
    {
      q: "Peut-on créer plusieurs entreprises dans l'application gestion de cartes de visites ?",
      a: "Oui, vous pouvez piloter plusieurs entités commerciales depuis un seul et unique compte utilisateur."
    },
    {
      q: "Comment l'application gestion de cartes de visites calcule-t-elle le pipeline ?",
      a: "Elle additionne toutes vos offres en cours pour vous donner une vision du chiffre d'affaires potentiel."
    },
    {
      q: "L'application gestion de cartes de visites est-elle intuitive ?",
      a: "Son interface épurée garantit une prise en main en moins de 5 minutes sans aucune formation technique."
    },
    {
      q: "Peut-on noter le lieu de rencontre dans l'application gestion de cartes de visites ?",
      a: "Oui, via le module événement qui lie vos contacts à un contexte géographique et temporel précis."
    },
    {
      q: "L'application gestion de cartes de visites remplace-t-elle LinkedIn ?",
      a: "Non, elle le complète en ajoutant une couche de suivi commercial et financier que LinkedIn ne propose pas."
    },
    {
      q: "Qui a créé l'application gestion de cartes de visites ?",
      a: "Une équipe d'experts en vente et en digital passionnés par l'efficacité et le networking productif."
    },
    {
      q: "L'application gestion de cartes de visites est-elle gourmande en batterie ?",
      a: "Non, elle est optimisée pour une consommation minimale, idéale pour les longues journées de salon professionnel."
    },
    {
      q: "Peut-on ajouter des notes libres dans l'application gestion de cartes de visites ?",
      a: "Chaque contact dispose d'un champ description pour noter les détails personnels ou les besoins spécifiques."
    },
    {
      q: "Comment l'application gestion de cartes de visites gère-t-elle les doublons ?",
      a: "Un système d'alerte vous prévient si un email ou un nom est déjà présent dans votre base."
    },
    {
      q: "L'application gestion de cartes de visites permet-elle de fixer des objectifs ?",
      a: "En visualisant votre pipeline, vous fixez naturellement des objectifs de conversion basés sur des données réelles."
    },
    {
      q: "Peut-on personnaliser les catégories dans l'application gestion de cartes de visites ?",
      a: "Les catégories sont optimisées pour la vente, mais vous pouvez utiliser les tags pour une personnalisation poussée."
    },
    {
      q: "L'application gestion de cartes de visites est-elle utile pour les freelances ?",
      a: "C'est l'outil parfait pour structurer son activité dès le premier client sans frais fixes importants."
    },
    {
      q: "Comment débuter avec l'application gestion de cartes de visites ?",
      a: "Inscrivez-vous, créez votre première entreprise et scannez votre première carte dès aujourd'hui pour voir la différence."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header
        showSettings={true}
        onSettingsClick={() => setCurrentPage('seo')}
      />

      <section className="pt-32 pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium mb-6 border border-gray-200">
                <Star className="w-4 h-4 fill-gray-700" />
                <span className="font-semibold">4.9</span>
                <span className="text-gray-500">sur Trustpilot</span>
              </div>

              <h1 className="text-6xl lg:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                Transformez vos rencontres en contrats
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Ne perdez plus jamais une opportunité commerciale après un salon. Pilotez votre réseau avec une stratégie de conversion automatisée et puissante.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 inline-flex items-center justify-center space-x-2">
                  <span>Commencer — Gratuit</span>
                </button>
                <button className="border-2 border-gray-200 hover:border-gray-300 text-gray-900 px-8 py-4 rounded-full font-medium text-lg transition-all duration-300">
                  Réserver une démo
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-50 rounded-3xl p-8 relative overflow-hidden border border-gray-200">
                <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-4 h-4 fill-gray-900 text-gray-900" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">+20%</p>
                  <p className="text-xs text-gray-600">Taux de conversion</p>
                </div>

                <div className="absolute bottom-8 left-8 bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">250+</p>
                      <p className="text-xs text-gray-600">Nouveaux contacts</p>
                    </div>
                  </div>
                </div>

                <div className="aspect-square bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-900 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-sm text-gray-600">Voir la démo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-2xl text-center text-gray-700 mb-20 max-w-4xl mx-auto leading-relaxed">
            Le networking sans suivi est une perte de temps massive. En utilisant notre application, vous installez un processus de vente rigoureux directement dans votre poche.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-24">
            <div className="text-center p-8 bg-white rounded-3xl border border-gray-100">
              <div className="text-6xl font-serif font-bold text-gray-900 mb-4">80%</div>
              <p className="text-sm uppercase tracking-wide text-gray-500">Réduction en communication manuelle</p>
            </div>
            <div className="text-center p-8 bg-white rounded-3xl border border-gray-100">
              <div className="text-6xl font-serif font-bold text-gray-900 mb-4">2-4x</div>
              <p className="text-sm uppercase tracking-wide text-gray-500">Plus d'engagement que les concurrents</p>
            </div>
            <div className="text-center p-8 bg-white rounded-3xl border border-gray-100">
              <div className="text-6xl font-serif font-bold text-gray-900 mb-4">40%</div>
              <p className="text-sm uppercase tracking-wide text-gray-500">Augmentation de l'engagement client</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="inline-block bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold mb-4 border border-gray-200 shadow-sm">
                Avant
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded border-2 border-gray-300 mr-3 mt-1 flex-shrink-0"></div>
                  <span className="text-gray-600 text-lg">Des piles de cartes de visite qui prennent la poussière</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded border-2 border-gray-300 mr-3 mt-1 flex-shrink-0"></div>
                  <span className="text-gray-600 text-lg">Oublis fréquents de relance après les événements</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded border-2 border-gray-300 mr-3 mt-1 flex-shrink-0"></div>
                  <span className="text-gray-600 text-lg">Aucune vision sur le chiffre d'affaires potentiel</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded border-2 border-gray-300 mr-3 mt-1 flex-shrink-0"></div>
                  <span className="text-gray-600 text-lg">Saisie manuelle fastidieuse et chronophage</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <div className="inline-block bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold mb-4 shadow-sm">
                Après
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="text-gray-900 mr-3 mt-1 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-900 text-lg font-medium">Un pipeline commercial digitalisé et toujours à jour</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-gray-900 mr-3 mt-1 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-900 text-lg font-medium">Notifications intelligentes pour un closing systématique</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-gray-900 mr-3 mt-1 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-900 text-lg font-medium">Tableau de bord en temps réel du CA gagné et à venir</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-gray-900 mr-3 mt-1 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-900 text-lg font-medium">Centralisation fluide de chaque opportunité d'affaires</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-serif font-bold mb-8 text-gray-900">Le chaos silencieux qui détruit votre rentabilité</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Vous revenez d'une conférence avec vingt contacts prometteurs, mais l'urgence du quotidien reprend le dessus. Sans une application robuste, ces relations s'endorment et vos concurrents prennent la place. La douleur de voir un prospect chaud devenir froid par simple négligence est le coût invisible qui freine votre expansion professionnelle.
          </p>
        </div>
      </section>

      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif font-bold text-gray-900 mb-6">La stratégie en 4 étapes pour dominer votre marché</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-300">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-6 text-white text-lg font-semibold">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Digitalisation immédiate</h3>
              <p className="text-gray-600 leading-relaxed">Scannez et intégrez chaque profil dans votre écosystème mobile en quelques secondes.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-300">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-6 text-white text-lg font-semibold">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Segmentation tactique</h3>
              <p className="text-gray-600 leading-relaxed">Identifiez instantanément vos leads, prospects, clients et partenaires pour une communication ciblée.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-300">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-6 text-white text-lg font-semibold">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Activation des offres</h3>
              <p className="text-gray-600 leading-relaxed">Associez des montants financiers et des opportunités précises à chaque fiche contact.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-300">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-6 text-white text-lg font-semibold">
                4
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Suivi automatisé</h3>
              <p className="text-gray-600 leading-relaxed">Utilisez nos rappels et relances pour maintenir un engagement constant jusqu'à la signature finale.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif font-bold text-gray-900 mb-6">Des fonctionnalités conçues pour les bâtisseurs d'empire</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tout ce dont vous avez besoin pour transformer vos contacts en contrats
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="p-8 rounded-3xl hover:bg-gray-50 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Tableau de bord de pilotage</h3>
              <p className="text-gray-600 leading-relaxed">Visualisez votre activité commerciale globale sur une interface épurée et intuitive.</p>
            </div>

            <div className="p-8 rounded-3xl hover:bg-gray-50 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Gestion d'événements intégrée</h3>
              <p className="text-gray-600 leading-relaxed">Regroupez vos rencontres par salon ou conférence pour analyser votre ROI.</p>
            </div>

            <div className="p-8 rounded-3xl hover:bg-gray-50 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Fiches contacts enrichies</h3>
              <p className="text-gray-600 leading-relaxed">Ajoutez des liens LinkedIn, des photos et des notes stratégiques pour ne rien oublier.</p>
            </div>

            <div className="p-8 rounded-3xl hover:bg-gray-50 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Tunnel de conversion visuel</h3>
              <p className="text-gray-600 leading-relaxed">Suivez l'évolution de vos relations professionnelles de la rencontre au contrat signé.</p>
            </div>

            <div className="p-8 rounded-3xl hover:bg-gray-50 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Synchronisation Cloud</h3>
              <p className="text-gray-600 leading-relaxed">Accédez à votre base de données sécurisée partout, tout le temps, même sans connexion.</p>
            </div>

            <div className="p-8 rounded-3xl hover:bg-gray-50 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Notifications intelligentes</h3>
              <p className="text-gray-600 leading-relaxed">Rappels automatiques pour ne jamais manquer une opportunité de relance.</p>
            </div>
          </div>

          <div className="text-center">
            <button className="bg-black hover:bg-gray-800 text-white px-10 py-5 rounded-full font-medium text-lg transition-all duration-300 inline-flex items-center space-x-2">
              <span>Bénéficiez de l'accès prioritaire</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-32 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-serif font-bold mb-8 text-gray-900">Libérez votre esprit de la charge mentale organisationnelle</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Votre cerveau est fait pour créer et convaincre, pas pour mémoriser des numéros de téléphone. Cette application agit comme une extension de votre mémoire commerciale, vous permettant de rester concentré sur l'humain. En déléguant l'organisation à notre solution technologique, vous retrouvez la sérénité nécessaire pour mener des négociations de haut niveau sans aucune friction.
          </p>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-serif font-bold mb-8 text-gray-900">Le moteur financier de votre réussite professionnelle</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            L'argent dort dans votre réseau actuel. Notre application connecte vos relations à vos objectifs financiers. En visualisant le montant de vos offres en cours et votre pipeline, vous ne naviguez plus à vue. Vous devenez un stratège capable de prévoir ses revenus grâce à une gestion de contacts millimétrée et performante.
          </p>
        </div>
      </section>

      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-serif font-bold mb-20 text-gray-900 text-center">Pourquoi les leaders choisissent notre plateforme</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Rapidité d'exécution</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Une interface pensée pour le terrain, fluide et sans fioritures inutiles.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Souveraineté des données</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Vos contacts vous appartiennent, stockés dans un environnement pro et hautement sécurisé.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Orientation résultat</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Chaque pixel de l'application est conçu pour favoriser la conversion commerciale et le closing.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-serif font-bold mb-8">Rejoignez l'élite des connecteurs de demain</h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            Il existe deux types de professionnels : ceux qui collectionnent les contacts et ceux qui bâtissent des relations rentables. En téléchargeant cette application, vous signalez à votre marché que vous appartenez à la seconde catégorie. C'est un choix d'identité. Devenez le professionnel reconnu pour sa fiabilité et son suivi impeccable, celui avec qui tout le monde veut travailler.
          </p>
        </div>
      </section>

      <section id="testimonials" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-serif font-bold mb-20 text-gray-900 text-center">Des solutions adaptées à chaque profil d'expert</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                  <Award className="w-5 h-5 text-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Le Consultant Indépendant</h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Vous enchaînez les rendez-vous mais vos notes sont éparpillées sur plusieurs supports. En adoptant notre application, vous centralisez tout. Marc, consultant en stratégie, a pu doubler ses relances efficaces en seulement un mois, transformant des contacts oubliés en missions de conseil à haute valeur ajoutée.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                  <TrendingUp className="w-5 h-5 text-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Le Commercial de Terrain</h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Votre métier, c'est le contact humain, pas la paperasse. Notre application est votre meilleure alliée entre deux rendez-vous. En scannant les cartes dès la sortie d'un bureau, vous assurez une mise à jour immédiate de votre CRM. Pour Sarah, 40 minutes gagnées chaque soir et une précision chirurgicale dans ses suivis.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                  <Star className="w-5 h-5 text-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Le Fondateur de Startup</h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Chaque investisseur ou partenaire rencontré est crucial pour votre survie. L'application vous aide à segmenter vos interlocuteurs et à suivre les promesses d'introduction. Ne laissez pas un business angel sans nouvelles. Utilisez les rappels pour maintenir le lien et montrer votre rigueur organisationnelle.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                  <Calendar className="w-5 h-5 text-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">L'Organisateur d'Événements</h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Gérer des centaines de prestataires et de participants demande une organisation militaire. Grâce à l'application, vous retrouvez n'importe quel contact par secteur d'activité ou par tag. C'est la garantie de trouver le bon photographe ou le bon traiteur en un instant.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-gradient-to-br from-blue-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-serif font-bold mb-8 text-gray-900">Dominez vos événements de networking avec agilité</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Chaque salon professionnel devient un terrain de chasse structuré. Ne vous contentez plus de "voir du monde". Avec notre application, vous arrivez avec une méthode, vous repartez avec des opportunités qualifiées et vous transformez l'essai dès le lendemain. C'est l'avantage tactique que vos concurrents n'ont pas encore anticipé.
          </p>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-serif font-bold mb-8 text-gray-900">Visualisez votre futur succès commercial</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Imaginez-vous à la fin du prochain trimestre. Votre chiffre d'affaires a progressé, vos clients sont satisfaits et votre réseau est plus solide que jamais. Tout cela parce que vous avez osé structurer votre approche. Cette application est le point de bascule entre l'amateurisme et l'excellence commerciale.
          </p>
        </div>
      </section>

      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif font-bold text-gray-900 mb-6">Des outils de pilotage pour chaque étape de votre croissance</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transformez vos données en décisions stratégiques avec nos outils de pilotage avancés
            </p>
          </div>

          <div className="space-y-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-4xl font-serif font-bold text-gray-900 mb-6">Un tableau de bord décisionnel puissant</h3>
                <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                  <p>
                    Le cœur de notre application réside dans sa capacité à synthétiser des données complexes en indicateurs simples. Visualisez le nombre total de vos contacts, le chiffre d'affaires gagné et les opportunités en attente de validation.
                  </p>
                  <p>
                    Identifiez quels événements ont été les plus rentables et ajustez votre stratégie marketing en conséquence. La simplicité de lecture garantit que vous ne passerez jamais plus de cinq minutes à analyser vos chiffres pour prendre les meilleures décisions.
                  </p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <div className="aspect-video bg-gray-50 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-24 h-24 text-gray-900" />
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <div className="aspect-video bg-gray-50 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-24 h-24 text-gray-900" />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-4xl font-serif font-bold text-gray-900 mb-6">La gestion d'événements pour un ROI maximal</h3>
                <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                  <p>
                    Intégrez un module dédié aux salons et conférences. Créez un événement en quelques clics, définissez le lieu et la date, et liez-y tous les contacts rencontrés sur place.
                  </p>
                  <p>
                    Le suivi après-salon est automatisé pour vous faire gagner des heures de travail administratif. Classez vos rencontres et suivez le taux de conversion spécifique à chaque canal pour optimiser votre prospection.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-4xl font-serif font-bold text-gray-900 mb-6">Des offres financières pour un pipeline structuré</h3>
                <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                  <p>
                    Ne vous contentez pas de stocker des noms, vendez. Chaque fiche contact peut être associée à une offre commerciale précise, transformant votre répertoire en un véritable tunnel de vente mobile.
                  </p>
                  <p>
                    Suivez le statut de chaque proposition et visualisez votre pipeline en temps réel. Cette transparence totale élimine le stress des prévisions et vous donne une confiance absolue lors de vos échanges commerciaux.
                  </p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <div className="aspect-video bg-gray-50 rounded-2xl flex items-center justify-center">
                  <FileText className="w-24 h-24 text-gray-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-serif font-bold mb-8 text-gray-900">Une garantie totale pour une sérénité absolue</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Nous supprimons 100% des risques. Notre application est conçue par des experts du terrain pour des gens de terrain. Si vous ne ressentez pas une clarté immédiate dans votre suivi commercial dès la première semaine, c'est que vous n'avez pas encore exploité tout le potentiel de notre méthode.
          </p>
        </div>
      </section>

      <section id="pricing" className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-serif font-bold mb-6 text-gray-900">Une implémentation sans aucune friction</h2>
            <p className="text-xl text-gray-600">En 4 étapes simples, commencez à transformer vos rencontres en contrats</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="text-center p-8">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-semibold text-lg mx-auto mb-6">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Téléchargement instantané</h3>
              <p className="text-gray-600">Accès immédiat sur votre store habituel</p>
            </div>
            <div className="text-center p-8">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-semibold text-lg mx-auto mb-6">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Configuration rapide</h3>
              <p className="text-gray-600">Profil configuré en 2 minutes</p>
            </div>
            <div className="text-center p-8">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-semibold text-lg mx-auto mb-6">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Importation facile</h3>
              <p className="text-gray-600">Contacts existants ou premier scan</p>
            </div>
            <div className="text-center p-8">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-semibold text-lg mx-auto mb-6">4</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Premier closing</h3>
              <p className="text-gray-600">Pilotez votre première opportunité</p>
            </div>
          </div>

          <div className="text-center">
            <button className="bg-black hover:bg-gray-800 text-white px-12 py-5 rounded-full font-medium text-xl transition-all duration-300 inline-flex items-center space-x-3 shadow-xl">
              <span>Propulsez votre business maintenant</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-5xl font-serif font-bold mb-16 text-gray-900 text-center">Questions Fréquentes</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="font-semibold text-gray-900 pr-4 text-lg">{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-900 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6 text-gray-600 text-lg leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8">Le coût réel de votre hésitation actuelle</h2>
          <p className="text-2xl mb-8 leading-relaxed text-gray-200">
            Chaque jour passé sans une application performante est une perte sèche de données et de revenus. Le temps que vous passez à chercher un email ou à essayer de vous souvenir d'un visage est du temps volé à votre croissance.
          </p>
          <p className="text-xl mb-12 font-medium text-gray-300">
            Le risque n'est pas d'essayer cet outil, le risque est de continuer sans lui dans un marché saturé de sollicitations.
          </p>
          <button className="bg-white hover:bg-gray-100 text-gray-900 px-12 py-5 rounded-full font-medium text-xl transition-all duration-300 inline-flex items-center space-x-3 shadow-2xl">
            <span>Commencer maintenant</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;
