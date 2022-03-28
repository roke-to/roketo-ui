const nearAPI = require("near-api-js");									   

const { connect, keyStores, WalletConnection } = nearAPI;

const config = {
  networkId: "testnet",
  //keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};
const start = async function(){
// connect to NEAR
const near = await connect(config);

// create wallet connection
const wallet = new WalletConnection(near);	


const signIn = () => {
  wallet.requestSignIn(
    "example-contract.testnet", // contract requesting access
    //"Example App", // optional
    //"http://YOUR-URL.com/success", // optional
    //"http://YOUR-URL.com/failure" // optional
  );
};	

if(wallet.isSignedIn()) {
    console.log("isSignedIn");
}
}
				 
										

																			   
							 
																					 
																				  
																				   

																	   
													 
																						

							

				
					   
													 
										  
											   
											   
												   
  

																	   
							   
								   
										  
															  
							
												 
																			 
																		
  
					 
															 
	
						   
						 
 
														

 

						 

	   

					   

												   
																				
								
	 
	

		
			
		 
