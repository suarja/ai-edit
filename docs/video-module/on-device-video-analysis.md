# Analyse Vidéo On-Device avec Expo Modules

## Objectif

L'objectif principal de cette initiative est de déplacer la logique d'analyse vidéo, actuellement gérée côté backend (via Gemini), directement sur l'appareil mobile de l'utilisateur. Cela permettra de réduire les coûts d'infrastructure, d'améliorer la réactivité de l'application et d'offrir une meilleure expérience utilisateur en tirant parti des capacités de traitement on-device, notamment via l'intégration du modèle HuggingSnap.

Nous visons à obtenir les métadonnées nécessaires pour les vidéos (titre, description, tags, séquençage si possible) directement après l'upload par l'utilisateur, sans passer par un service cloud externe pour l'analyse.

## Plan d'Action

Voici les étapes clés pour intégrer l'analyse vidéo on-device :

1.  **Création d'un Module Natif Expo Local** :
    *   Nous allons générer un nouveau module natif Expo directement dans le projet mobile. Ce module servira de pont entre le code JavaScript/TypeScript de l'application et le code natif Swift qui effectuera l'analyse.
    *   Ce module sera configuré pour iOS dans un premier temps, en se basant sur les exemples et la documentation d'Expo Modules.

2.  **Intégration de la Logique d'Analyse de `HuggingSnap`** :
    *   Les fichiers Swift pertinents de l'application démo `HuggingSnap` (notamment ceux liés à l'évaluation des modèles de langage visuels - VLM) seront copiés et adaptés dans le répertoire iOS du nouveau module Expo.
    *   Les dépendances natives (comme MLX, MLXVLM) utilisées par `HuggingSnap` devront être correctement déclarées et gérées via le fichier `.podspec` du module Expo pour assurer leur intégration et compilation.

3.  **Exposition d'une API Simple via le Module Natif** :
    *   Le module natif exposera une fonction asynchrone simple (par exemple, `analyzeVideo(videoUri: String)`) accessible depuis JavaScript.
    *   Cette fonction prendra en entrée l'URI locale de la vidéo à analyser, déclenchera la logique d'analyse on-device, et retournera un objet JSON contenant les métadonnées extraites (titre, description, tags, etc.).

4.  **Mise à Jour du Composant `VideoUploader.tsx`** :
    *   Le composant `VideoUploader.tsx` sera modifié pour appeler la nouvelle fonction `analyzeVideo` du module natif après la sélection d'une vidéo par l'utilisateur.
    *   Le processus d'upload vers S3 et l'appel au backend pour l'analyse seront remplacés par cet appel direct au module natif.
    *   Les résultats de l'analyse on-device seront ensuite traités par les fonctions existantes (`handleAnalysisComplete`, `handleError`) pour mettre à jour l'interface utilisateur et la base de données.

## Fichiers Natifs Importants et leur Rôle

Pour comprendre le code natif et notre objectif, voici une explication des fichiers clés de `HuggingSnap` et de la structure d'un module Expo :

### Fichiers de `HuggingSnap` (Référence)

*   **`HuggingSnapApp.swift`** : Le point d'entrée principal de l'application SwiftUI. Il initialise l'environnement et la `ContentView`.
*   **`ContentView.swift`** : La vue principale de l'application. Elle gère l'affichage de la caméra, des vidéos/images importées, et interagit avec le `ContentViewModel` et le `VLMEvaluator`.
*   **`Camera/CameraManager.swift`** : Gère l'accès à la caméra, la capture de photos et l'enregistrement de vidéos. Il utilise `AVCaptureSession` pour configurer le flux vidéo et audio.
*   **`Camera/FrameManager.swift`** : Reçoit les `CMSampleBuffer` du `CameraManager` et les convertit en `CVPixelBuffer` pour un traitement ultérieur (par exemple, par le VLM).
*   **`VLMEvaluator.swift`** : **C'est le cœur de l'analyse on-device.** Ce fichier contient la logique pour charger et exécuter les modèles de langage visuels (VLM) de Hugging Face (comme SmolVLM2) sur l'appareil. Il gère l'inférence et la génération de texte à partir d'images ou de vidéos. C'est ce composant que nous allons intégrer dans notre module Expo.
*   **`Extensions/*.swift`** : Diverses extensions Swift qui fournissent des fonctionnalités utilitaires (par exemple, `CGImageExtension.swift` pour la conversion de `CVPixelBuffer` en `CGImage`, `Transferable.swift` pour la gestion des transferts de fichiers).
*   **`HuggingSnap.xcodeproj/project.pbxproj`** et **`HuggingSnap.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`** : Ces fichiers définissent les dépendances du projet Xcode, y compris les packages Swift (comme `mlx-swift-examples` qui contient MLX et MLXVLM) et leurs versions. Ces informations seront cruciales pour configurer les dépendances de notre module Expo.

### Structure d'un Module Expo (Cible)

*   **`ios/VideoAnalyzerModule.swift`** (ou un nom similaire) : Ce sera le fichier principal de notre module natif Expo. Il contiendra la définition du module (`ModuleDefinition`) et exposera les fonctions (`AsyncFunction`) qui seront appelables depuis JavaScript/TypeScript.
*   **`ios/Records.swift`** (ou un nom similaire) : Ce fichier définira les structures de données Swift (`Record`) qui seront utilisées pour typer les entrées et sorties des fonctions exposées par le module. Cela assure une forte typisation entre le code natif et le code JavaScript/TypeScript.
*   **`ios/Package.swift`** (ou un fichier de configuration similaire pour les dépendances Swift) : Ce fichier, ou une section équivalente dans le `.podspec` du module, listera les dépendances Swift nécessaires (MLX, MLXVLM) pour que le module puisse compiler et fonctionner.
*   **`VideoAnalyzerModule.ts`** (dans le répertoire du module Expo) : Le fichier de définition TypeScript pour le module. Il déclarera les interfaces et les types pour les fonctions et les événements exposés par le module natif, permettant une utilisation typée dans l'application React Native.
*   **`VideoAnalyzerModule.podspec`** (dans le répertoire du module Expo) : Le fichier de spécification CocoaPods pour le module. Il définira les sources des fichiers natifs, les dépendances (y compris les frameworks comme MLX et MLXVLM), et les configurations de compilation nécessaires pour le module iOS.

## État Actuel et Défis Rencontrés

Nous avons progressé dans la création du module natif `expo-video-analyzer`, la refactorisation des fichiers Swift (`VLMEvaluator.swift`, `Records.swift`, `ExpoVideoAnalyzerModule.swift`) et la configuration initiale du `.podspec` du module. Cependant, l'intégration des dépendances `mlx-swift` (qui incluent `MLX`, `MLXLMCommon`, `MLXVLM`) et `swift-transformers` (pour `Hub`) s'est avérée problématique.

Le défi principal réside dans le fait que `mlx-swift` est principalement conçu pour être utilisé avec Swift Package Manager (SPM) et ne dispose pas d'un support officiel ou simple pour CocoaPods. Les tentatives d'intégration via des `config-plugins` ou des `swift_package` dans le `Podfile` principal ont échoué en raison de limitations de CocoaPods et de l'ordre de chargement des helpers.

En conséquence, l'erreur `no such module 'MLX'` persiste lors de la compilation du projet iOS, indiquant que les dépendances SPM ne sont pas correctement liées au module natif.

## Options pour l'Analyse Vidéo On-Device

Face aux défis d'intégration de `mlx-swift` via CocoaPods, nous devons envisager des approches alternatives pour l'analyse vidéo on-device :

### Option 1 : Intégration Manuelle de `mlx-swift` (Fortement Déconseillée)
*   **Description** : Cette option implique d'ajouter manuellement les dépendances Swift Package Manager (`mlx-swift`, etc.) directement dans Xcode après chaque exécution de `npx expo prebuild`. C'est la seule méthode qui fonctionnait avant de trouver une solution automatisée.
*   **Inconvénients** : Très manuelle, rompt le flux de travail d'Expo, sujette aux erreurs et incompatible avec la CI/CD.

### Option 2 : Intégration Automatisée des Dépendances SPM via un Plugin (Recommandée)
*   **Description** : Cette approche utilise un **plugin de configuration Expo** pour modifier le fichier `project.pbxproj` et lier correctement les dépendances SPM à la cible principale de l'application. Cela résout le problème de "framework manquant" sur les appareils physiques et automatise entièrement le processus.
*   **Avantages** :
    *   **Automatisé** : S'intègre parfaitement au flux de travail `npx expo prebuild`.
    *   **Fiable** : Assure que les dépendances sont correctement liées pour les builds de production.
    *   **Maintenable** : La configuration est définie une seule fois dans le plugin.
*   **Plan d'action** :
    1.  Déclarer `mlx-swift` et ses dépendances dans le fichier `ExpoVideoAnalyzer.podspec` en utilisant la fonction `spm_dependency`.
    2.  Créer un plugin de configuration local (par exemple, `plugins/withSpmDependencies.js`) en s'inspirant de la documentation trouvée dans `docs/video-module/spm-deps.md`.
    3.  Adapter ce plugin pour qu'il ajoute les dépendances SPM (`mlx-swift`, `mlx-swift-examples`, etc.) à la cible principale de l'application iOS.
    4.  Ajouter le plugin à la section `plugins` du fichier `app.json`.
*   **Conclusion** : C'est la solution la plus robuste et la plus propre pour intégrer `mlx-swift` et poursuivre l'objectif initial d'utiliser la logique de `HuggingSnap`.

### Option 3 : Explorer des Alternatives (Plan de Secours)
Si l'approche avec le plugin SPM s'avérait plus complexe que prévu, les alternatives restent valables :
*   **Utiliser Core ML directement** : L'approche la plus native et optimisée pour iOS, mais nécessite de trouver ou convertir un modèle compatible et de ne pas utiliser `VLMEvaluator` de `HuggingSnap`.
*   **Rechercher d'autres bibliothèques ML on-device** : Des bibliothèques comme **TensorFlow Lite** (avec `react-native-vision-camera` et `react-native-fast-tflite`) offrent une excellente alternative multi-plateforme avec un bon support de l'écosystème React Native.
*   **Fallback Temporaire au Backend** : Revenir à l'analyse côté backend (via Gemini) si une solution on-device rapide est impossible à mettre en œuvre.

En suivant ce plan et en comprenant le rôle de ces fichiers, nous pourrons intégrer efficacement la logique d'analyse vidéo on-device dans votre application mobile.
