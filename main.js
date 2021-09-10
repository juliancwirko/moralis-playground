// Playing with Moralis. The code is messy. That was quick coding.

(function () {
  // Moralis keys - replace them with yours, only my user can add to the collection with this setup
  const MORALIS_APP_ID = 't8ro2ujjMB7W3uYIO3eLa82qytTsR1dckLOZSmYn';
  const MORALIS_SERVER = 'https://gz80jxgvlfey.moralis.io:2053/server';
  // Adjust collection names according to your Moralis database configuration
  const NOTES_COLLECTION_NAME = 'JULNotes';
  const FILES_COLLECTION_NAME = 'JULFiles';
  const CHAIN_ID = 'goerli'; // Ethereum testnet chain

  const loginButton = document.getElementById('login');
  const logoutButton = document.getElementById('logout');
  const userAddress = document.getElementById('user-address');
  const helpInfo = document.getElementById('help-info');
  const transactionsContainer = document.getElementById('transactions-list');
  const loggedInSection = document.getElementById('for-logged-in-user');
  const notesContainer = document.getElementById('notes-container');
  const addNewNoteButton = document.getElementById('add-new-note-button');
  const addNewNoteTextarea = document.getElementById('add-new-note-textarea');
  const fileInput = document.getElementById('file-input');
  const imagesWrapper = document.getElementById('images-wrapper');

  // Moralis initialize (paste your keys)
  Moralis.initialize(MORALIS_APP_ID);
  Moralis.serverURL = MORALIS_SERVER;
  const web3 = new Moralis.Web3();

  // General UI logic for switching between logged in and logged out states
  const switchLoginStateInUI = function (user) {
    if (user) {
      userAddress.innerHTML = user.get('ethAddress');
      helpInfo.classList.add('js-disabled');
      loginButton.classList.add('js-disabled');
      logoutButton.classList.remove('js-disabled');
      loggedInSection.classList.remove('js-disabled');
      // List all transactions on this address
      Moralis.Web3API.account.getTransactions({ chain: CHAIN_ID, address: user.get('ethAddress') })
        .then(function (transactions) {
          transactionsContainer.innerHTML = '';
          transactions.result.forEach(function (transaction) {
            const transactionWrapper = document.createElement('div');
            transactionWrapper.innerHTML = transaction.hash + ' | value: ' + web3.utils.fromWei(transaction.value, 'ether') + ' Eth';
            transactionsContainer.appendChild(transactionWrapper);
          });
        })
        .catch(function (error) {
          console.log('Error: ', error);
        })
    } else {
      userAddress.innerHTML = '';
      helpInfo.classList.remove('js-disabled');
      loginButton.classList.remove('js-disabled');
      logoutButton.classList.add('js-disabled');
      loggedInSection.classList.add('js-disabled');
    }
  };

  // List all notes from Moralis cloud collection
  const handleNotes = function () {
    // Create Moralis example storage object
    const JULNotes = Moralis.Object.extend(NOTES_COLLECTION_NAME);
    const julNotesQuery = new Moralis.Query(JULNotes);
    const julNotes = new JULNotes();
  
    // Note item UI
    const addNoteUIChange = function (note) {
      const deleteButton = document.createElement('button');
      deleteButton.dataset.id = note.id;
      deleteButton.classList.add('js-delete-note');
      deleteButton.classList.add('button');
      deleteButton.classList.add('button-small');
      deleteButton.innerHTML = '&#10006;';
      const noteWrap = document.createElement('div');
      noteWrap.classList.add('note-wrapper');
      const noteText = document.createElement('div');
      noteText.classList.add('note-text');
      noteText.innerHTML = note.get('note');
      noteWrap.appendChild(noteText);
      noteWrap.appendChild(deleteButton);
      notesContainer.appendChild(noteWrap);
    };

    julNotesQuery.find()
    .then(function (notes) {
      notesContainer.innerHTML = '';
      notes.forEach(function (note) {
        addNoteUIChange(note);
      });

      // Add event listener for removing notes
      document.querySelectorAll('.js-delete-note').forEach(function (elem) {
        elem.addEventListener('click', function (event) {
          event.target.parentNode.parentNode.removeChild(event.target.parentNode);
          // Remove particular note from Moralis cloud collection
          julNotesQuery.get(event.target.dataset.id).then(function (obj) {
            obj.destroy();
          });
        });
      });
    })
    .catch(function (error) {
      console.log('Error: ', error);
    });

    // Event listener for adding new note
    addNewNoteButton.addEventListener('click', function () {
      const noteText = addNewNoteTextarea.value;
      if (noteText) {
        julNotes.save({ note: noteText })
          .then(function (note) {
            addNoteUIChange(note);
            addNewNoteTextarea.value = '';
          });
      }
    });
  };

  // Moralis file input and IPFS demo
  const handleFileInput = function () {
    fileInput.addEventListener('change', function (event) {
      const data = event.target.files[0];
      const file = new Moralis.File(data.name, data);
      file.saveIPFS().then(function (file) {
        const JULFiles = Moralis.Object.extend(FILES_COLLECTION_NAME);
        const julFiles = new JULFiles();
        julFiles.save({ file: file }).then(function () {
          const imageElem = document.createElement('img');
          imageElem.setAttribute('src', file.ipfs());
          imagesWrapper.appendChild(imageElem);
        });
      }).catch(function (error) {
        console.log('Error: ', error);
      });
    });

    const julFilesQuery = new Moralis.Query(FILES_COLLECTION_NAME);
    julFilesQuery.find().then(function (files) {
      imagesWrapper.innerHTML = '';
      files.forEach(function (file) {
        const imageElem = document.createElement('img');
        imageElem.setAttribute('src', file.get('file').ipfs());
        imagesWrapper.appendChild(imageElem);
      });
    });
  };

  // ==============================================================================
  // Check if user is logged in
  Moralis.User.currentAsync()
    .then(function(user) {
      if (user) {
        switchLoginStateInUI(user);
        handleNotes();
        handleFileInput();
      } else {
        switchLoginStateInUI(null);
      }
    })
    .catch(function (error) {
      console.log('Error: ', error);
    });

  // Login user using crypto auth (Metamask)
  loginButton.addEventListener('click', function () {
    Moralis.authenticate()
      .then(function (user) {
        switchLoginStateInUI(user);
        handleNotes();
        handleFileInput();
      })
      .catch(function (error) {
        console.log('Error: ', err);
      });
  });
  
  // Logut user
  logoutButton.addEventListener('click', function () {
    Moralis.User.logOut()
      .then(function () {
        switchLoginStateInUI(null);
      })
      .catch(function (error) {
        console.log('Error: ', err);
      });
  });
})();
