package projetoAPDC.util.authentication;

import java.util.UUID;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.PathElement;

public class AuthToken {
	public static final long EXPIRATION_TIME = 1000*60*60*2; //2h
	
	public String email;
	public String tokenID;
	public long creationDate;
	public long expirationDate;
	
	public AuthToken() {}
	
	public AuthToken(String username) {
		this.email = username;
		this.tokenID = UUID.randomUUID().toString();
		this.creationDate = System.currentTimeMillis();
		this.expirationDate = this.creationDate + AuthToken.EXPIRATION_TIME;
	}
	
	public boolean isValid(Datastore datastore) {
		Key tokenKey = datastore.newKeyFactory().addAncestor(PathElement.of("User", email))
				.setKind("Token")
				.newKey(tokenID);
		Entity tokenEnt = datastore.get(tokenKey);
		
		return tokenEnt != null && tokenID.equals(tokenEnt.getString("id"))
				&& tokenEnt.getLong("expirationData") > System.currentTimeMillis();
	}

}
